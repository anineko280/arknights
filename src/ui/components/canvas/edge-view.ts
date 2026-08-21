import { StoryEdge } from '../../../core/types.js';

export interface EdgeViewProps {
  edge: StoryEdge;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export class EdgeView {
  public readonly element: SVGPathElement;

  constructor(private props: EdgeViewProps) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.render();
  }

  public update(newProps: Partial<EdgeViewProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  private render(): void {
    const { edge, sourceX, sourceY, targetX, targetY, isHighlighted, isDimmed } = this.props;

    // Start point: right center of source node
    const startX = sourceX + 200;
    const startY = sourceY + 44;

    // End point: left center of target node
    const endX = targetX;
    const endY = targetY + 44;

    // Bezier control points
    const dx = Math.max(40, (endX - startX) * 0.5);
    const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

    this.element.setAttribute('d', pathD);
    this.element.setAttribute('class', `story-edge-path ${isHighlighted ? 'highlighted' : ''} ${isDimmed ? 'dimmed' : ''}`);
    this.element.setAttribute('data-id', edge.id);
    this.element.setAttribute('marker-end', isHighlighted ? 'url(#arrow-active)' : 'url(#arrow-default)');

    if (edge.relationType === 'recommended_reading' || edge.relationType === 'spinoff') {
      this.element.setAttribute('stroke-dasharray', '5,4');
    } else {
      this.element.removeAttribute('stroke-dasharray');
    }
  }
}
