import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FULL_STORY_DATASET } from '../../src/core/data/dataset.js';
import { StoryGraphEngine } from '../../src/core/graph/graph-engine.js';
import { StorageService } from '../../src/core/storage/storage-service.js';
import { parseAndValidateBackupJSON } from '../../src/core/storage/backup-validator.js';

describe('Story Flowchart End-to-End Integration Flow', () => {
  let engine: StoryGraphEngine;
  let storage: StorageService;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; }
    });

    engine = new StoryGraphEngine(FULL_STORY_DATASET);
    storage = new StorageService();
  });

  it('Scenario 1: User starts reading and unlocks recommendations in order', () => {
    // 1. Initial state: root chapters recommended
    let completed = new Set(
      Object.entries(storage.getAllProgress())
        .filter(([, p]) => p.status === 'completed')
        .map(([id]) => id)
    );
    let recommended = engine.getRecommendedNextStories(completed);
    expect(recommended.map(n => n.id)).toContain('main-00-awakening');

    // 2. Complete Chapter 0
    storage.setProgress('main-00-awakening', 'completed');
    completed = new Set(
      Object.entries(storage.getAllProgress())
        .filter(([, p]) => p.status === 'completed')
        .map(([id]) => id)
    );
    recommended = engine.getRecommendedNextStories(completed);

    // 3. Chapter 1 is now recommended, Chapter 0 is no longer recommended
    expect(recommended.map(n => n.id)).toContain('main-01-evil-time');
    expect(recommended.map(n => n.id)).not.toContain('main-00-awakening');
  });

  it('Scenario 2: User exports backup, resets, and restores progress accurately', () => {
    storage.setProgress('main-00-awakening', 'completed');
    storage.setProgress('main-01-evil-time', 'completed');
    storage.setProgress('intermezzi-darknights-memoir', 'reading');

    // Export
    const backup = storage.exportBackupData();
    const backupJson = JSON.stringify(backup);

    // Reset
    storage.clearAllProgress();
    expect(storage.getAllProgress()).toEqual({});

    // Import & Validate
    const validation = parseAndValidateBackupJSON(backupJson);
    expect(validation.isValid).toBe(true);
    if (validation.data) {
      storage.importBackupData(validation.data);
    }

    // Verify Restoration
    expect(storage.getProgress('main-00-awakening')?.status).toBe('completed');
    expect(storage.getProgress('main-01-evil-time')?.status).toBe('completed');
    expect(storage.getProgress('intermezzi-darknights-memoir')?.status).toBe('reading');
  });

  it('Scenario 3: Filter and search across storylines', () => {
    // Filter by Victoria faction
    const victoria = engine.filterGraph({ faction: 'ヴィクトリア帝国' });
    expect(victoria.nodes.length).toBeGreaterThan(0);
    expect(victoria.nodes.some(n => n.id === 'main-09-stormwatch')).toBe(true);

    // Filter by keyword
    const search = engine.filterGraph({ searchKeyword: '孤星' });
    expect(search.nodes.length).toBe(1);
    expect(search.nodes[0].id).toBe('side-lone-trail');
  });
});
