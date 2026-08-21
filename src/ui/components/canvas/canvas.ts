import { StoryNode, StoryEdge, ProgressStatus } from '../../../core/types.js';
import { calculateTimelineLayout, PositionedNode } from '../../../core/graph/layout.js';
import { NodeView } from './node-view.js';
import { EdgeView } from './edge-view.js';

export interface CanvasCallbacks {
  onSelectNode: (node: StoryNode) => void;
  onDeselect: () => void;
}

export class StoryCanvas {
  public readonly container: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly zoomGroup: SVGGElement;
  private readonly edgesGroup: SVGGElement;
  private readonly nodesGroup: SVGGElement;

  private scale: number = 1;
  private translateX: number = 40;
  private translateY: number = 40;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;

  private positionedNodes: Map<string, PositionedNode> = new Map();
  private nodeViews: Map<string, NodeView> = new Map();
  private edgeViews: Map<string, EdgeView> = new Map();

  private selectedNodeId: string | null = null;
  private recommendedNodeIds: Set<string> = new Set();
  private progressMap: Record<string, ProgressStatus> = {};
  private activeFilterIds: Set<string> | null = null;

  constructor(private callbacks: CanvasCallbacks) {
    this.container = document.createElement('div');
    this.container.className = 'graph-canvas-container';

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'graph-svg');

    // Create SVG Defs for markers and effects
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.25)" />
      </marker>
      <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#00e5ff" />
      </marker>
    `;
    this.svg.appendChild(defs);

    this.zoomGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.zoomGroup.appendChild(this.edgesGroup);
    this.zoomGroup.appendChild(this.nodesGroup);
    this.svg.appendChild(this.zoomGroup);
    this.container.appendChild(this.svg);

    // Floating Controls
    const controls = document.createElement('div');
    controls.className = 'canvas-controls';
    controls.innerHTML = `
      <button id="btn-zoom-in" title="ズームイン">+</button>
      <button id="btn-zoom-out" title="ズームアウト">-</button>
      <button id="btn-reset-view" title="全体表示">⌂</button>
    `;
    this.container.appendChild(controls);

    // Floating Legend
    const legend = document.createElement('div');
    legend.className = 'canvas-legend';
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-color" style="background:#00e5ff"></span>メインテーマ</div>
      <div class="legend-item"><span class="legend-color" style="background:#a855f7"></span>幕間 / エピソード</div>
      <div class="legend-item"><span class="legend-color" style="background:#ff9f1c"></span>サイドストーリー</div>
    `;
    this.container.appendChild(legend);

    this.setupEvents();
    this.updateTransform();
  }

  public setData(
    nodes: readonly StoryNode[],
    edges: readonly StoryEdge[],
    progressMap: Record<string, ProgressStatus>,
    recommendedNodeIds: Set<string>,
    activeFilterIds: Set<string> | null = null
  ): void {
    this.progressMap = progressMap;
    this.recommendedNodeIds = recommendedNodeIds;
    this.activeFilterIds = activeFilterIds;

    const layoutNodes = calculateTimelineLayout(nodes);
    this.positionedNodes.clear();
    for (const node of layoutNodes) {
      this.positionedNodes.set(node.id, node);
    }

    // Render Edges
    this.edgesGroup.innerHTML = '';
    this.edgeViews.clear();
    for (const edge of edges) {
      const source = this.positionedNodes.get(edge.sourceId);
      const target = this.positionedNodes.get(edge.targetId);
      if (source && target) {
        const isDimmed = this.activeFilterIds !== null && (!this.activeFilterIds.has(edge.sourceId) || !this.activeFilterIds.has(edge.targetId));
        const isHighlighted = this.selectedNodeId === edge.sourceId || this.selectedNodeId === edge.targetId;

        const edgeView = new EdgeView({
          edge,
          sourceX: source.calculatedX,
          sourceY: source.calculatedY,
          targetX: target.calculatedX,
          targetY: target.calculatedY,
          isHighlighted,
          isDimmed
        });
        this.edgeViews.set(edge.id, edgeView);
        this.edgesGroup.appendChild(edgeView.element);
      }
    }

    // Render Nodes
    this.nodesGroup.innerHTML = '';
    this.nodeViews.clear();
    for (const node of layoutNodes) {
      const isDimmed = this.activeFilterIds !== null && !this.activeFilterIds.has(node.id);
      const isSelected = this.selectedNodeId === node.id;
      const isRecommended = this.recommendedNodeIds.has(node.id);
      const status = this.progressMap[node.id] || 'unread';

      const nodeView = new NodeView({
        node,
        x: node.calculatedX,
        y: node.calculatedY,
        status,
        isRecommended,
        isSelected,
        isDimmed,
        isHighlighted: false,
        onClick: (selected) => {
          this.selectNode(selected.id);
          this.callbacks.onSelectNode(selected);
        }
      });
      this.nodeViews.set(node.id, nodeView);
      this.nodesGroup.appendChild(nodeView.element);
    }
  }

  public selectNode(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
    for (const [id, nodeView] of this.nodeViews) {
      nodeView.update({
        isSelected: id === nodeId
      });
    }

    for (const [, edgeView] of this.edgeViews) {
      // Highlight incoming or outgoing edges
      const edge = (edgeView as any).props.edge;
      const isHighlighted = nodeId !== null && (edge.sourceId === nodeId || edge.targetId === nodeId);
      edgeView.update({ isHighlighted });
    }
  }

  public resetView(): void {
    this.scale = 0.85;
    this.translateX = 60;
    this.translateY = 60;
    this.updateTransform();
  }

  public zoomIn(): void {
    this.scale = Math.min(2.5, this.scale * 1.25);
    this.updateTransform();
  }

  public zoomOut(): void {
    this.scale = Math.max(0.25, this.scale / 1.25);
    this.updateTransform();
  }

  private updateTransform(): void {
    this.zoomGroup.setAttribute(
      'transform',
      `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`
    );
  }

  private setupEvents(): void {
    // Mouse drag for panning
    this.container.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('.canvas-controls') || (e.target as HTMLElement).closest('.canvas-legend')) {
        return;
      }
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Wheel for zooming
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.max(0.25, Math.min(2.5, this.scale * zoomFactor));

      // Zoom towards mouse pointer
      const rect = this.container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.translateX = mouseX - (mouseX - this.translateX) * (newScale / this.scale);
      this.translateY = mouseY - (mouseY - this.translateY) * (newScale / this.scale);
      this.scale = newScale;

      this.updateTransform();
    }, { passive: false });

    // Background click to deselect
    this.svg.addEventListener('click', (e) => {
      if (e.target === this.svg || e.target === this.zoomGroup || e.target === this.edgesGroup) {
        this.selectNode(null);
        this.callbacks.onDeselect();
      }
    });

    // Control buttons
    this.container.querySelector('#btn-zoom-in')?.addEventListener('click', () => this.zoomIn());
    this.container.querySelector('#btn-zoom-out')?.addEventListener('click', () => this.zoomOut());
    this.container.querySelector('#btn-reset-view')?.addEventListener('click', () => this.resetView());
  }
}
