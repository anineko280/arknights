/**
 * ストーリーグラフおよびノード・エッジの公開インターフェース契約
 */

export type StoryCategory = 'main' | 'intermezzi' | 'side_story' | 'story_collection';

export type EdgeRelationType =
  | 'direct_prerequisite'
  | 'chronological_next'
  | 'recommended_reading'
  | 'spinoff';

export interface StoryNode {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly originalTitle?: string;
  readonly category: StoryCategory;
  readonly era: string;
  readonly chronologicalOrder: number;
  readonly releaseDate: string;
  readonly summary: string;
  readonly spoilerSummary?: string;
  readonly factions: readonly string[];
  readonly characters: readonly string[];
  readonly x: number;
  readonly y: number;
}

export interface StoryEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly relationType: EdgeRelationType;
  readonly description?: string;
}

export interface StoryDataset {
  readonly version: string;
  readonly nodes: readonly StoryNode[];
  readonly edges: readonly StoryEdge[];
}

export interface GraphFilterOptions {
  readonly category?: StoryCategory | 'all';
  readonly faction?: string | 'all';
  readonly searchKeyword?: string;
  readonly sortMode?: 'chronological' | 'release' | 'default';
}

export interface IStoryGraphEngine {
  /** 全ノードとエッジを取得 */
  getDataset(): StoryDataset;

  /** ノードIDによる個別取得 */
  getNodeById(id: string): StoryNode | undefined;

  /** 指定ノードの前提ストーリーノード一覧を取得 */
  getPrerequisites(nodeId: string): StoryNode[];

  /** 指定ノードの後続ストーリーノード一覧を取得 */
  getSuccessors(nodeId: string): StoryNode[];

  /** 読了進捗に基づき、次に読むべき推奨ストーリーノード一覧を抽出 */
  getRecommendedNextStories(completedNodeIds: ReadonlySet<string>): StoryNode[];

  /** フィルターおよび検索条件に基づくノード・エッジの抽出 */
  filterGraph(options: GraphFilterOptions): {
    nodes: StoryNode[];
    edges: StoryEdge[];
  };
}
