/**
 * アークナイツ ストーリーフローチャート コア型定義
 */

export type StoryCategory = 'main' | 'intermezzi' | 'side_story' | 'story_collection';

export type EdgeRelationType =
  | 'direct_prerequisite'    // 直接の前提ストーリー（必読）
  | 'chronological_next'      // 時系列直後のストーリー
  | 'recommended_reading'     // 推奨副読・背景補完
  | 'spinoff';                // 外伝・派生

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

export type ProgressStatus = 'unread' | 'reading' | 'completed' | 'skipped';

export interface UserProgress {
  readonly nodeId: string;
  readonly status: ProgressStatus;
  readonly updatedAt: string;
  readonly note?: string;
}

export interface UserSettings {
  readonly spoilerMaskEnabled: boolean;
  readonly activeFilterCategory: StoryCategory | 'all';
  readonly activeFilterFaction: string | 'all';
  readonly sortMode: 'chronological' | 'release' | 'default';
}

export interface ProgressBackupData {
  readonly version: '1.0.0';
  readonly exportedAt: string;
  readonly progresses: Record<string, UserProgress>;
  readonly settings: UserSettings;
}
