import { StoryNode, StoryCategory } from '../types.js';

export interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalLaneHeight: number;
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  nodeWidth: 200,
  nodeHeight: 90,
  horizontalSpacing: 80,
  verticalLaneHeight: 220
};

export interface PositionedNode extends StoryNode {
  readonly calculatedX: number;
  readonly calculatedY: number;
}

/**
 * ストーリーノードのカテゴリ別・時系列レーン自動配置計算
 */
export function calculateTimelineLayout(
  nodes: readonly StoryNode[],
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): PositionedNode[] {
  // カテゴリごとのY軸基準オフセット
  const categoryLaneIndex: Record<StoryCategory, number> = {
    main: 0,
    intermezzi: 1,
    side_story: 2,
    story_collection: 3
  };

  // 時系列順にソート
  const sortedNodes = [...nodes].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);

  // カテゴリごとの現在の配置数追跡
  const laneNodeCounts: Record<StoryCategory, number> = {
    main: 0,
    intermezzi: 0,
    side_story: 0,
    story_collection: 0
  };

  return sortedNodes.map((node) => {
    const lane = categoryLaneIndex[node.category] ?? 0;
    const countInLane = laneNodeCounts[node.category]++;

    const calculatedX = 80 + countInLane * (options.nodeWidth + options.horizontalSpacing);
    const calculatedY = 80 + lane * options.verticalLaneHeight;

    return {
      ...node,
      calculatedX,
      calculatedY
    };
  });
}
