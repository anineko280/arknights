import { StoryNode, ProgressStatus, StoryCategory } from '../../../core/types.js';

export interface NodeViewProps {
  node: StoryNode;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status: ProgressStatus;
  isRecommended: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isHighlighted: boolean;
  onClick: (node: StoryNode) => void;
}

const CATEGORY_COLORS: Record<StoryCategory, string> = {
  main: '#00e5ff',
  intermezzi: '#a855f7',
  side_story: '#ff9f1c',
  story_collection: '#10b981'
};

const STATUS_COLORS: Record<ProgressStatus, string> = {
  unread: '#475569',
  reading: '#f59e0b',
  completed: '#00e5ff',
  skipped: '#64748b'
};

export class NodeView {
  public readonly element: SVGGElement;

  constructor(private props: NodeViewProps) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.render();
  }

  public update(newProps: Partial<NodeViewProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  private render(): void {
    const { node, x, y, status, isRecommended, isSelected, isDimmed, isHighlighted } = this.props;
    const width = this.props.width ?? 200;
    const height = this.props.height ?? 88;

    this.element.setAttribute('class', `story-node-group ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''} ${isHighlighted ? 'highlighted' : ''}`);
    this.element.setAttribute('transform', `translate(${x}, ${y})`);
    this.element.setAttribute('data-id', node.id);

    const categoryColor = CATEGORY_COLORS[node.category] || '#00e5ff';
    const statusColor = STATUS_COLORS[status] || '#475569';

    // SVG Card HTML
    this.element.innerHTML = `
      <!-- Node Background -->
      <rect class="node-card-bg" x="0" y="0" width="${width}" height="${height}" rx="6" />
      
      <!-- Category Color Indicator Bar -->
      <rect x="0" y="0" width="4" height="${height}" rx="2" fill="${categoryColor}" />
      
      <!-- Status Badge Pill -->
      <rect class="node-status-bar" x="${width - 64}" y="10" width="54" height="16" rx="3" fill="${statusColor}" opacity="0.2" stroke="${statusColor}" stroke-width="0.8" />
      <text x="${width - 37}" y="22" text-anchor="middle" font-size="9" font-weight="600" fill="${statusColor}" font-family="var(--font-sans)">
        ${status === 'completed' ? '読了' : status === 'reading' ? '閲覧中' : status === 'skipped' ? 'スキップ' : '未読'}
      </text>

      ${isRecommended ? `
        <!-- Recommended Badge -->
        <rect x="10" y="-8" width="50" height="15" rx="3" fill="#ff0054" />
        <text x="35" y="3" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff" font-family="var(--font-sans)">★ 推奨</text>
      ` : ''}

      <!-- Code & Title -->
      <text class="node-code" x="14" y="22" fill="${categoryColor}">${node.code}</text>
      <text class="node-title" x="14" y="44">${escapeXml(truncateText(node.title, 13))}</text>
      
      <!-- Era / Timeline -->
      <text class="node-era" x="14" y="66">${escapeXml(node.era)}</text>
    `;

    this.element.onclick = (e) => {
      e.stopPropagation();
      this.props.onClick(node);
    };
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
