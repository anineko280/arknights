import { ProgressBackupData } from '../../../core/types.js';
import { parseAndValidateBackupJSON } from '../../../core/storage/backup-validator.js';

export interface BackupModalCallbacks {
  onExport: () => ProgressBackupData;
  onImport: (backup: ProgressBackupData) => void;
  onReset: () => void;
}

export class BackupModal {
  public readonly element: HTMLElement;

  constructor(private callbacks: BackupModalCallbacks) {
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.render();
  }

  public open(): void {
    this.element.classList.add('open');
    this.render();
  }

  public close(): void {
    this.element.classList.remove('open');
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="modal-card">
        <div class="modal-title">
          <span>📁 進捗データのバックアップと復元</span>
        </div>

        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          ブラウザのキャッシュ消去時のデータ消失防止や、別端末への引き継ぎのために進捗データをJSONファイルとしてダウンロード・復元できます。
        </div>

        <!-- Action Box: Export -->
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
          <strong style="font-size: 13px; color: var(--text-primary);">1. エクスポート（JSONダウンロード）</strong>
          <p style="font-size: 12px; color: var(--text-muted);">現在の読了進捗と設定をJSONファイルとして保存します。</p>
          <button id="btn-modal-export" class="btn btn-primary" style="align-self: flex-start;">
            ⬇️ JSONファイルをダウンロード
          </button>
        </div>

        <!-- Action Box: Import -->
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
          <strong style="font-size: 13px; color: var(--text-primary);">2. インポート（ファイルから復元）</strong>
          <p style="font-size: 12px; color: var(--text-muted);">保存済みのJSONファイルを選択して進捗を復元します。</p>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" />
          <button id="btn-modal-import" class="btn" style="align-self: flex-start;">
            ⬆️ JSONファイルを選択して復元
          </button>
          <div id="import-error-msg" style="font-size: 12px; color: #ff0054; display: none;"></div>
        </div>

        <!-- Action Box: Reset -->
        <div style="background: rgba(255,0,84,0.05); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid rgba(255,0,84,0.2); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 12px; color: #ff6b8b;">全進捗のリセット</strong>
            <p style="font-size: 11px; color: var(--text-muted);">すべての読了チェックを初期状態に戻します。</p>
          </div>
          <button id="btn-modal-reset" class="btn" style="border-color: rgba(255,0,84,0.4); color: #ff6b8b;">リセット</button>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
          <button id="btn-modal-close" class="btn">閉じる</button>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents(): void {
    this.element.querySelector('#btn-modal-close')?.addEventListener('click', () => this.close());
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    // Export JSON
    this.element.querySelector('#btn-modal-export')?.addEventListener('click', () => {
      const backupData = this.callbacks.onExport();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arknights-story-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import JSON
    const fileInput = this.element.querySelector('#import-file-input') as HTMLInputElement;
    const btnImport = this.element.querySelector('#btn-modal-import');
    const errorMsg = this.element.querySelector('#import-error-msg') as HTMLElement;

    btnImport?.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = parseAndValidateBackupJSON(text);
        if (result.isValid && result.data) {
          this.callbacks.onImport(result.data);
          alert('進捗データが正常に復元されました！');
          this.close();
        } else {
          errorMsg.textContent = `復元エラー: ${result.error || '不明なエラー'}`;
          errorMsg.style.display = 'block';
        }
      };
      reader.readAsText(file);
    });

    // Reset All
    this.element.querySelector('#btn-modal-reset')?.addEventListener('click', () => {
      if (confirm('すべての進捗データをリセットしますか？この操作は取り消せません。')) {
        this.callbacks.onReset();
        alert('進捗データを初期化しました。');
        this.close();
      }
    });
  }
}
