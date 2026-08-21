import { describe, it, expect } from 'vitest';
import { validateBackupData, parseAndValidateBackupJSON } from '../../src/core/storage/backup-validator.js';
import { ProgressBackupData } from '../../src/core/types.js';

describe('Backup Validation (US-4 / P3)', () => {
  const validBackup: ProgressBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    progresses: {
      'main-00-awakening': {
        nodeId: 'main-00-awakening',
        status: 'completed',
        updatedAt: new Date().toISOString(),
        note: 'クリア済み'
      }
    },
    settings: {
      spoilerMaskEnabled: true,
      activeFilterCategory: 'all',
      activeFilterFaction: 'all',
      sortMode: 'default'
    }
  };

  it('should pass validation for valid backup object', () => {
    const result = validateBackupData(validBackup);
    expect(result.isValid).toBe(true);
  });

  it('should parse and validate valid JSON string', () => {
    const jsonStr = JSON.stringify(validBackup);
    const result = parseAndValidateBackupJSON(jsonStr);
    expect(result.isValid).toBe(true);
    expect(result.data?.progresses['main-00-awakening'].status).toBe('completed');
  });

  it('should reject invalid JSON format', () => {
    const result = parseAndValidateBackupJSON('{ broken json');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('JSON構文エラー');
  });

  it('should reject backup missing version or with unsupported version', () => {
    const invalidVersion = { ...validBackup, version: '99.0.0' };
    const result = validateBackupData(invalidVersion as any);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('サポートされていないバックアップバージョン');
  });

  it('should reject corrupted progress entries', () => {
    const corrupted = {
      ...validBackup,
      progresses: {
        'test-node': {
          nodeId: 'test-node',
          status: 'invalid_status' // invalid status
        }
      }
    };
    const result = validateBackupData(corrupted as any);
    expect(result.isValid).toBe(false);
  });
});
