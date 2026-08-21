import { UserSettings } from '../../../core/types.js';

export interface HeaderCallbacks {
  onToggleSpoiler: (enabled: boolean) => void;
  onOpenBackupModal: () => void;
  onResetAll: () => void;
}

export class Header {
  public readonly element: HTMLElement;
  private totalNodes: number = 0;
  private completedNodes: number = 0;
  private settings: UserSettings;

  constructor(
    settings: UserSettings,
    totalNodes: number,
    completedNodes: number,
    private callbacks: HeaderCallbacks
  ) {
    this.settings = settings;
    this.totalNodes = totalNodes;
    this.completedNodes = completedNodes;

    this.element = document.createElement('header');
    this.element.className = 'app-header';
    this.render();
  }

  public updateProgress(totalNodes: number, completedNodes: number): void {
    this.totalNodes = totalNodes;
    this.completedNodes = completedNodes;
    this.render();
  }

  public updateSettings(settings: UserSettings): void {
    this.settings = settings;
    this.render();
  }

  private render(): void {
    const percentage = this.totalNodes > 0
      ? Math.round((this.completedNodes / this.totalNodes) * 100)
      : 0;

    this.element.innerHTML = `
      <div class="header-brand">
        <div class="header-logo">
          <span>ARKNIGHTS</span>
          <span class="badge">RHODES ISLAND</span>
        </div>
        <span class="header-title">ストーリー フローチャート</span>
      </div>

      <div class="header-stats">
        <div class="progress-pill">
          <div class="progress-text">読了進捗: <span>${this.completedNodes}/${this.totalNodes}</span> (${percentage}%)</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button id="btn-toggle-spoiler" class="btn ${this.settings.spoilerMaskEnabled ? 'btn-primary' : ''}" title="ネタバレ保護の切り替え">
          ${this.settings.spoilerMaskEnabled ? '🛡️ ネタバレ防止: ON' : '👁️ ネタバレ防止: OFF'}
        </button>

        <button id="btn-backup" class="btn" title="データバックアップ・復元">
          📁 バックアップ / 復元
        </button>
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents(): void {
    this.element.querySelector('#btn-toggle-spoiler')?.addEventListener('click', () => {
      const next = !this.settings.spoilerMaskEnabled;
      this.callbacks.onToggleSpoiler(next);
    });

    this.element.querySelector('#btn-backup')?.addEventListener('click', () => {
      this.callbacks.onOpenBackupModal();
    });
  }
}
