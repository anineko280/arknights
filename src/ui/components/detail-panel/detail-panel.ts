import { StoryNode, ProgressStatus } from '../../../core/types.js';

export interface DetailPanelCallbacks {
  onStatusChange: (nodeId: string, status: ProgressStatus) => void;
  onClose: () => void;
}

export class DetailPanel {
  public readonly element: HTMLElement;
  private currentNode: StoryNode | null = null;
  private currentStatus: ProgressStatus = 'unread';
  private prereqNodes: StoryNode[] = [];
  private successorNodes: StoryNode[] = [];
  private spoilerMaskEnabled: boolean = true;
  private isSpoilerRevealed: boolean = false;

  constructor(private callbacks: DetailPanelCallbacks) {
    this.element = document.createElement('aside');
    this.element.className = 'detail-panel';
    this.render();
  }

  public showNode(
    node: StoryNode,
    status: ProgressStatus,
    prereqs: StoryNode[],
    successors: StoryNode[],
    spoilerMaskEnabled: boolean
  ): void {
    this.currentNode = node;
    this.currentStatus = status;
    this.prereqNodes = prereqs;
    this.successorNodes = successors;
    this.spoilerMaskEnabled = spoilerMaskEnabled;
    this.isSpoilerRevealed = false;

    this.element.classList.add('open');
    this.render();
  }

  public close(): void {
    this.currentNode = null;
    this.element.classList.remove('open');
    this.callbacks.onClose();
  }

  public updateSpoilerSetting(enabled: boolean): void {
    this.spoilerMaskEnabled = enabled;
    if (this.currentNode) {
      this.render();
    }
  }

  private render(): void {
    if (!this.currentNode) {
      this.element.innerHTML = '';
      return;
    }

    const node = this.currentNode;
    const isMasked = this.spoilerMaskEnabled && !this.isSpoilerRevealed && this.currentStatus !== 'completed';

    this.element.innerHTML = `
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-code">${escapeHtml(node.code)}</span>
          <h2 class="panel-title">${escapeHtml(node.title)}</h2>
        </div>
        <button id="btn-panel-close" class="btn btn-icon" title="閉じる">✕</button>
      </div>

      <div class="panel-content">
        <!-- Status & Meta Section -->
        <div>
          <div class="panel-section-title">閲覧ステータス</div>
          <div style="display:flex; gap:8px;">
            <button class="btn status-btn ${this.currentStatus === 'unread' ? 'btn-primary' : ''}" data-status="unread">未読</button>
            <button class="btn status-btn ${this.currentStatus === 'reading' ? 'btn-primary' : ''}" data-status="reading">閲覧中</button>
            <button class="btn status-btn ${this.currentStatus === 'completed' ? 'btn-primary' : ''}" data-status="completed">読了</button>
            <button class="btn status-btn ${this.currentStatus === 'skipped' ? 'btn-primary' : ''}" data-status="skipped">スキップ</button>
          </div>
        </div>

        <!-- Factions & Era -->
        <div>
          <div class="panel-section-title">基本情報 / 舞台</div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; color:var(--text-secondary);">
            <div><strong>テラ暦年代:</strong> ${escapeHtml(node.era)}</div>
            <div><strong>公開日:</strong> ${escapeHtml(node.releaseDate)}</div>
            <div>
              <strong>関連勢力:</strong>
              <div class="badge-row" style="margin-top:4px;">
                ${node.factions.map(f => `<span class="tag-badge">${escapeHtml(f)}</span>`).join('')}
              </div>
            </div>
            <div>
              <strong>主要登場人物:</strong>
              <div class="badge-row" style="margin-top:4px;">
                ${node.characters.map(c => `<span class="tag-badge">${escapeHtml(c)}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Prerequisites -->
        <div>
          <div class="panel-section-title">前提ストーリー (必読・推奨)</div>
          ${this.prereqNodes.length === 0 ? `
            <div style="font-size:12px; color:var(--text-muted);">前提ストーリーはありません（どこからでも閲覧可能）</div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${this.prereqNodes.map(p => `
                <div style="background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:4px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
                  <span><strong>${escapeHtml(p.code)}</strong> ${escapeHtml(p.title)}</span>
                  <span style="font-size:11px; color:var(--text-accent);">前提</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Successors -->
        ${this.successorNodes.length > 0 ? `
          <div>
            <div class="panel-section-title">後続・派生ストーリー</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${this.successorNodes.map(s => `
                <div style="background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:4px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
                  <span><strong>${escapeHtml(s.code)}</strong> ${escapeHtml(s.title)}</span>
                  <span style="font-size:11px; color:#ff9f1c;">後続</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Summary -->
        <div>
          <div class="panel-section-title">あらすじ・概要</div>
          <div class="summary-card">
            ${escapeHtml(node.summary)}
          </div>
        </div>

        <!-- Spoiler / Detailed Summary -->
        ${node.spoilerSummary ? `
          <div>
            <div class="panel-section-title" style="display:flex; justify-content:space-between; align-items:center;">
              <span>核心ネタバレ・結末</span>
              ${isMasked ? `<span style="font-size:10px; color:#f59e0b;">⚠️ ネタバレ保護中 (クリックで解除)</span>` : ''}
            </div>
            <div id="spoiler-box" class="summary-card ${isMasked ? 'spoiler-masked' : 'spoiler-revealed'}" title="${isMasked ? 'クリックしてネタバレを表示' : ''}">
              ${escapeHtml(node.spoilerSummary)}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents(): void {
    this.element.querySelector('#btn-panel-close')?.addEventListener('click', () => this.close());

    const statusBtns = this.element.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const newStatus = target.getAttribute('data-status') as ProgressStatus;
        if (this.currentNode && newStatus) {
          this.currentStatus = newStatus;
          this.callbacks.onStatusChange(this.currentNode.id, newStatus);
          this.render();
        }
      });
    });

    const spoilerBox = this.element.querySelector('#spoiler-box');
    spoilerBox?.addEventListener('click', () => {
      if (this.spoilerMaskEnabled && !this.isSpoilerRevealed) {
        this.isSpoilerRevealed = true;
        this.render();
      }
    });
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
