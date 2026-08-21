import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../src/core/storage/storage-service.js';

describe('StorageService (US-2 / P2)', () => {
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
    storage = new StorageService();
  });

  it('should initialize with default settings and empty progress', () => {
    const settings = storage.getSettings();
    expect(settings.spoilerMaskEnabled).toBe(true);
    expect(storage.getAllProgress()).toEqual({});
  });

  it('should save and retrieve progress status', () => {
    storage.setProgress('main-00-awakening', 'completed', '初見クリア');
    const p = storage.getProgress('main-00-awakening');
    expect(p).toBeDefined();
    expect(p?.status).toBe('completed');
    expect(p?.note).toBe('初見クリア');
  });

  it('should update user settings', () => {
    storage.updateSettings({ spoilerMaskEnabled: false });
    expect(storage.getSettings().spoilerMaskEnabled).toBe(false);
  });

  it('should clear all progress', () => {
    storage.setProgress('main-00-awakening', 'completed');
    storage.clearAllProgress();
    expect(storage.getAllProgress()).toEqual({});
  });
});
