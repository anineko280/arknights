import { StoryDataset, StoryNode, StoryEdge, StoryCategory } from '../types.js';

export interface GraphFilterCriteria {
  category?: StoryCategory | 'all';
  faction?: string | 'all';
  searchKeyword?: string;
  sortMode?: 'chronological' | 'release' | 'default';
}

export class StoryGraphEngine {
  private readonly nodesMap: Map<string, StoryNode>;
  private readonly incomingEdges: Map<string, StoryEdge[]>;
  private readonly outgoingEdges: Map<string, StoryEdge[]>;

  constructor(private readonly dataset: StoryDataset) {
    this.nodesMap = new Map();
    this.incomingEdges = new Map();
    this.outgoingEdges = new Map();

    for (const node of dataset.nodes) {
      this.nodesMap.set(node.id, node);
      this.incomingEdges.set(node.id, []);
      this.outgoingEdges.set(node.id, []);
    }

    for (const edge of dataset.edges) {
      if (this.incomingEdges.has(edge.targetId)) {
        this.incomingEdges.get(edge.targetId)!.push(edge);
      }
      if (this.outgoingEdges.has(edge.sourceId)) {
        this.outgoingEdges.get(edge.sourceId)!.push(edge);
      }
    }
  }

  public getDataset(): StoryDataset {
    return this.dataset;
  }

  public getAllNodes(): readonly StoryNode[] {
    return this.dataset.nodes;
  }

  public getAllEdges(): readonly StoryEdge[] {
    return this.dataset.edges;
  }

  public getNodeById(id: string): StoryNode | undefined {
    return this.nodesMap.get(id);
  }

  /**
   * 指定ノードの前提ストーリー（incoming direct_prerequisite & recommended_reading）を取得
   */
  public getPrerequisites(nodeId: string): StoryNode[] {
    const edges = this.incomingEdges.get(nodeId) || [];
    return edges
      .map(edge => this.nodesMap.get(edge.sourceId))
      .filter((node): node is StoryNode => node !== undefined);
  }

  /**
   * 指定ノードの後続ストーリー（outgoing edges）を取得
   */
  public getSuccessors(nodeId: string): StoryNode[] {
    const edges = this.outgoingEdges.get(nodeId) || [];
    return edges
      .map(edge => this.nodesMap.get(edge.targetId))
      .filter((node): node is StoryNode => node !== undefined);
  }

  /**
   * 読了進捗に基づき、次に読むべき推奨ストーリーノード一覧を判定
   * 条件:
   * 1. 自身が未読であること
   * 2. direct_prerequisite（直接の前提条件）のエッジの接続元がすべて読了済みであること
   */
  public getRecommendedNextStories(completedNodeIds: ReadonlySet<string>): StoryNode[] {
    const recommended: StoryNode[] = [];

    for (const node of this.dataset.nodes) {
      if (completedNodeIds.has(node.id)) {
        continue;
      }

      const incoming = this.incomingEdges.get(node.id) || [];
      const directPrereqs = incoming.filter(e => e.relationType === 'direct_prerequisite');

      const allPrereqsMet = directPrereqs.every(e => completedNodeIds.has(e.sourceId));
      if (allPrereqsMet) {
        recommended.push(node);
      }
    }

    // 時系列順（chronologicalOrder）でソート
    return recommended.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
  }

  /**
   * フィルター・検索条件によるノードとエッジの抽出
   */
  public filterGraph(criteria: GraphFilterCriteria): {
    nodes: StoryNode[];
    edges: StoryEdge[];
    matchedNodeIds: Set<string>;
  } {
    let filteredNodes = [...this.dataset.nodes];

    // 分類フィルター
    if (criteria.category && criteria.category !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.category === criteria.category);
    }

    // 陣営フィルター
    if (criteria.faction && criteria.faction !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.factions.includes(criteria.faction!));
    }

    // 検索キーワード
    if (criteria.searchKeyword && criteria.searchKeyword.trim() !== '') {
      const q = criteria.searchKeyword.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        (n.originalTitle && n.originalTitle.toLowerCase().includes(q)) ||
        n.factions.some(f => f.toLowerCase().includes(q)) ||
        n.characters.some(c => c.toLowerCase().includes(q)) ||
        n.summary.toLowerCase().includes(q)
      );
    }

    // ソート
    if (criteria.sortMode === 'chronological') {
      filteredNodes.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
    } else if (criteria.sortMode === 'release') {
      filteredNodes.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
    }

    const matchedNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = this.dataset.edges.filter(
      e => matchedNodeIds.has(e.sourceId) && matchedNodeIds.has(e.targetId)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      matchedNodeIds
    };
  }
}
