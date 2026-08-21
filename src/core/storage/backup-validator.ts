import { ProgressBackupData, ProgressStatus } from '../types.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: ProgressBackupData;
}

const VALID_STATUSES: Set<ProgressStatus> = new Set(['unread', 'reading', 'completed', 'skipped']);

export function validateBackupData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'データがオブジェクト形式ではありません。' };
  }

  const backup = data as Partial<ProgressBackupData>;

  if (backup.version !== '1.0.0') {
    return {
      isValid: false,
      error: `サポートされていないバックアップバージョンです: ${backup.version ?? '不明'}`
    };
  }

  if (!backup.progresses || typeof backup.progresses !== 'object') {
    return { isValid: false, error: '進捗データ (progresses) が存在しません。' };
  }

  for (const [nodeId, progress] of Object.entries(backup.progresses)) {
    if (!progress || typeof progress !== 'object') {
      return { isValid: false, error: `ノード ${nodeId} の進捗形式が不正です。` };
    }
    if (!VALID_STATUSES.has((progress as any).status)) {
      return { isValid: false, error: `ノード ${nodeId} のステータス値が無効です: ${(progress as any).status}` };
    }
  }

  return {
    isValid: true,
    data: data as ProgressBackupData
  };
}

export function parseAndValidateBackupJSON(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateBackupData(parsed);
  } catch (e: any) {
    return {
      isValid: false,
      error: `JSON構文エラー: ${e.message || '解析に失敗しました'}`
    };
  }
}
