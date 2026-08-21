import { describe, it, expect, beforeEach } from 'vitest';
import { StoryGraphEngine } from '../../src/core/graph/graph-engine.js';
import { FULL_STORY_DATASET } from '../../src/core/data/dataset.js';

describe('Story Filtering & Search (US-3 / P3)', () => {
  let engine: StoryGraphEngine;

  beforeEach(() => {
    engine = new StoryGraphEngine(FULL_STORY_DATASET);
  });

  it('should filter by category (main theme only)', () => {
    const res = engine.filterGraph({ category: 'main' });
    expect(res.nodes.length).toBeGreaterThan(0);
    expect(res.nodes.every(n => n.category === 'main')).toBe(true);
  });

  it('should filter by faction (e.g., カジミエーシュ)', () => {
    const res = engine.filterGraph({ faction: 'カジミエーシュ' });
    expect(res.nodes.length).toBeGreaterThan(0);
    expect(res.nodes.every(n => n.factions.includes('カジミエーシュ'))).toBe(true);
  });

  it('should search by keyword matching title, character, or summary', () => {
    const res1 = engine.filterGraph({ searchKeyword: 'チェルノボグ' });
    expect(res1.nodes.length).toBeGreaterThan(0);

    const res2 = engine.filterGraph({ searchKeyword: 'クリステン' });
    expect(res2.nodes.some(n => n.id === 'side-lone-trail')).toBe(true);
  });

  it('should sort nodes chronologically', () => {
    const res = engine.filterGraph({ sortMode: 'chronological' });
    for (let i = 0; i < res.nodes.length - 1; i++) {
      expect(res.nodes[i].chronologicalOrder).toBeLessThanOrEqual(res.nodes[i + 1].chronologicalOrder);
    }
  });
});
