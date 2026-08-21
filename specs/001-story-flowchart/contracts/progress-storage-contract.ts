/**
 * 読了進捗管理・ローカルストレージ・バックアップ契約
 */

export type ProgressStatus = 'unread' | 'reading' | 'completed' | 'skipped';

export interface UserProgress {
  readonly nodeId: string;
  readonly status: ProgressStatus;
  readonly updatedAt: string;
  readonly note?: string;
}

export interface UserSettings {
  readonly spoilerMaskEnabled: boolean;
  readonly activeFilterCategory?: string;
  readonly activeFilterFaction?: string;
  readonly sortMode?: string;
}

export interface ProgressBackupData {
  readonly version: '1.0.0';
  readonly exportedAt: string;
  readonly progresses: Record<string, UserProgress>;
  readonly settings: UserSettings;
}

export interface IProgressStorageService {
  /** 全進捗マップを取得 */
  getAllProgress(): Record<string, UserProgress>;

  /** 特定ノードの進捗を取得 */
  getProgress(nodeId: string): UserProgress | undefined;

  /** 特定ノードの進捗ステータスを更新 */
  setProgress(nodeId: string, status: ProgressStatus, note?: string): UserProgress;

  /** ユーザー設定の取得 */
  getSettings(): UserSettings;

  /** ユーザー設定の更新 */
  updateSettings(settings: Partial<UserSettings>): UserSettings;

  /** バックアップ用JSONデータの生成（エクスポート） */
  exportBackupData(): ProgressBackupData;

  /** バックアップ用JSONデータの検証と復元（インポート） */
  importBackupData(jsonString: string): { success: boolean; importedCount: number; error?: string };

  /** 進捗データのリセット */
  clearAllProgress(): void;
}
