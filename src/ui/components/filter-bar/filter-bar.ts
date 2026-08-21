import { StoryCategory } from '../../../core/types.js';

export interface FilterBarState {
  category: StoryCategory | 'all';
  faction: string | 'all';
  searchKeyword: string;
  sortMode: 'default' | 'chronological' | 'release';
}

export interface FilterBarCallbacks {
  onChange: (state: FilterBarState) => void;
}

const FACTIONS_LIST = [
  'ロドス',
  'レユニオン',
  '龍門近衛局',
  'ヴィクトリア帝国',
  'カズデル',
  'バベル',
  'カジミエーシュ',
  'リターニア',
  'ライン生命',
  'アビサルハンター',
  'ペンギン急便'
];

export class FilterBar {
  public readonly element: HTMLElement;
  private state: FilterBarState;

  constructor(initialState: Partial<FilterBarState>, private callbacks: FilterBarCallbacks) {
    this.state = {
      category: 'all',
      faction: 'all',
      searchKeyword: '',
      sortMode: 'default',
      ...initialState
    };

    this.element = document.createElement('nav');
    this.element.className = 'filter-bar';
    this.render();
  }

  public getState(): FilterBarState {
    return { ...this.state };
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="filter-group">
        <span class="filter-label">分類:</span>
        <button class="filter-btn ${this.state.category === 'all' ? 'active' : ''}" data-category="all">すべて</button>
        <button class="filter-btn ${this.state.category === 'main' ? 'active' : ''}" data-category="main">メインテーマ</button>
        <button class="filter-btn ${this.state.category === 'intermezzi' ? 'active' : ''}" data-category="intermezzi">幕間 / エピソード</button>
        <button class="filter-btn ${this.state.category === 'side_story' ? 'active' : ''}" data-category="side_story">サイドストーリー</button>
      </div>

      <div class="filter-group">
        <span class="filter-label">勢力:</span>
        <select id="faction-select" class="btn" style="padding: 4px 8px; font-size: 12px; background: rgba(0,0,0,0.3);">
          <option value="all">すべての勢力</option>
          ${FACTIONS_LIST.map(f => `<option value="${f}" ${this.state.faction === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>

      <div class="filter-group">
        <div class="search-box">
          <span style="color:var(--text-muted); font-size:12px;">🔍</span>
          <input id="search-input" type="text" placeholder="キーワード・キャラ検索..." value="${escapeHtml(this.state.searchKeyword)}" />
        </div>
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents(): void {
    const categoryBtns = this.element.querySelectorAll('[data-category]');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-category') as StoryCategory | 'all';
        this.state.category = cat;
        this.render();
        this.callbacks.onChange(this.state);
      });
    });

    const factionSelect = this.element.querySelector('#faction-select') as HTMLSelectElement;
    factionSelect?.addEventListener('change', (e) => {
      this.state.faction = (e.target as HTMLSelectElement).value;
      this.callbacks.onChange(this.state);
    });

    const searchInput = this.element.querySelector('#search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.state.searchKeyword = (e.target as HTMLInputElement).value;
      this.callbacks.onChange(this.state);
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
