import { UserProgress, ProgressStatus, UserSettings, ProgressBackupData } from '../types.js';

const PROGRESS_STORAGE_KEY = 'arknights_story_progress_v1';
const SETTINGS_STORAGE_KEY = 'arknights_story_settings_v1';

export class StorageService {
  private progressMap: Record<string, UserProgress> = {};
  private settings: UserSettings;

  constructor() {
    this.settings = {
      spoilerMaskEnabled: true,
      activeFilterCategory: 'all',
      activeFilterFaction: 'all',
      sortMode: 'default'
    };
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (rawProgress) {
          this.progressMap = JSON.parse(rawProgress);
        }

        const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (rawSettings) {
          this.settings = { ...this.settings, ...JSON.parse(rawSettings) };
        }
      }
    } catch (e) {
      console.warn('Failed to load data from localStorage:', e);
    }
  }

  public getAllProgress(): Record<string, UserProgress> {
    return { ...this.progressMap };
  }

  public getProgress(nodeId: string): UserProgress | undefined {
    return this.progressMap[nodeId];
  }

  public setProgress(nodeId: string, status: ProgressStatus, note?: string): UserProgress {
    const record: UserProgress = {
      nodeId,
      status,
      updatedAt: new Date().toISOString(),
      note
    };
    this.progressMap[nodeId] = record;
    this.saveProgress();
    return record;
  }

  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<UserSettings>): UserSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    return this.getSettings();
  }

  public clearAllProgress(): void {
    this.progressMap = {};
    this.saveProgress();
  }

  public exportBackupData(): ProgressBackupData {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      progresses: this.getAllProgress(),
      settings: this.getSettings()
    };
  }

  public importBackupData(backup: ProgressBackupData): void {
    this.progressMap = { ...backup.progresses };
    this.settings = { ...this.settings, ...backup.settings };
    this.saveProgress();
    this.saveSettings();
  }

  private saveProgress(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progressMap));
      }
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
  }

  private saveSettings(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  }
}
