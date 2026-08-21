import { StoryDataset, StoryEdge } from '../types.js';
import { MAIN_THEME_NODES } from './main-theme.js';
import { INTERMEZZI_NODES } from './intermezzi.js';
import { SIDE_STORY_NODES } from './side-stories.js';

export const STORY_EDGES: readonly StoryEdge[] = [
  // メインテーマ第1部（チェルノボグ・龍門事変）接続
  { id: 'e-m00-m01', sourceId: 'main-00-awakening', targetId: 'main-01-evil-time', relationType: 'direct_prerequisite', description: 'チェルノボグ脱出作戦' },
  { id: 'e-m01-m02', sourceId: 'main-01-evil-time', targetId: 'main-02-crossroads', relationType: 'direct_prerequisite', description: '龍門への移動' },
  { id: 'e-m02-m03', sourceId: 'main-02-crossroads', targetId: 'main-03-prelude', relationType: 'direct_prerequisite', description: 'スカルシュレッダー追跡' },
  { id: 'e-m03-m04', sourceId: 'main-03-prelude', targetId: 'main-04-burning-run', relationType: 'direct_prerequisite', description: 'チェルノボグ石棺調査' },
  { id: 'e-m04-m05', sourceId: 'main-04-burning-run', targetId: 'main-05-necessary-solution', relationType: 'direct_prerequisite', description: '龍門防衛戦' },
  { id: 'e-m05-m06', sourceId: 'main-05-necessary-solution', targetId: 'main-06-partial-necrosis', relationType: 'direct_prerequisite', description: 'スノーデビル小隊決戦' },
  { id: 'e-m06-m07', sourceId: 'main-06-partial-necrosis', targetId: 'main-07-the-birth-of-tragedy', relationType: 'direct_prerequisite', description: 'パトリオット遊撃隊との激突' },
  { id: 'e-m07-m08', sourceId: 'main-07-the-birth-of-tragedy', targetId: 'main-08-roaring-flare', relationType: 'direct_prerequisite', description: '第1部決戦・タルラ阻止' },

  // メインテーマ第2部（ヴィクトリア・ロンディニウム動乱）接続
  { id: 'e-m08-m09', sourceId: 'main-08-roaring-flare', targetId: 'main-09-stormwatch', relationType: 'chronological_next', description: '第2部開幕・ヒロック事変' },
  { id: 'e-m09-m10', sourceId: 'main-09-stormwatch', targetId: 'main-10-shattered-shackles', relationType: 'direct_prerequisite', description: 'ロンディニウム潜入' },
  { id: 'e-m10-m11', sourceId: 'main-10-shattered-shackles', targetId: 'main-11-return-to-mist', relationType: 'direct_prerequisite', description: '蒸気騎士の記憶' },
  { id: 'e-m11-m12', sourceId: 'main-11-return-to-mist', targetId: 'main-12-all-quiet-under-the-sun', relationType: 'direct_prerequisite', description: '公爵軍包囲戦' },
  { id: 'e-m12-m13', sourceId: 'main-12-all-quiet-under-the-sun', targetId: 'main-13-the-dissolution-of-the-past', relationType: 'direct_prerequisite', description: '防壁決壊と過去の影' },
  { id: 'e-m13-m14', sourceId: 'main-13-the-dissolution-of-the-past', targetId: 'main-14-absorb-light', relationType: 'direct_prerequisite', description: '第2部完結・原初の源石' },

  // 幕間・エピソード前提および推奨副読関係
  { id: 'e-dnm-m00', sourceId: 'intermezzi-darknights-memoir', targetId: 'main-00-awakening', relationType: 'recommended_reading', description: 'ロドス創設とWの前日譚' },
  { id: 'e-dnm-m07', sourceId: 'intermezzi-darknights-memoir', targetId: 'main-07-the-birth-of-tragedy', relationType: 'recommended_reading', description: 'Wの思惑とバベルの遺志' },
  { id: 'e-ut-sn', sourceId: 'intermezzi-under-tides', targetId: 'intermezzi-stultifera-navis', relationType: 'direct_prerequisite', description: '深海・アビサルシリーズ後編' },
  { id: 'e-babel-m14', sourceId: 'intermezzi-babel', targetId: 'main-14-absorb-light', relationType: 'direct_prerequisite', description: '第14章の核心的過去記録' },
  { id: 'e-awd-lt', sourceId: 'intermezzi-a-walk-in-the-dust', targetId: 'side-lone-trail', relationType: 'recommended_reading', description: 'ケルシーとテラの旧遺産' },

  // サイドストーリー連作関係
  { id: 'e-mn-nl', sourceId: 'side-maria-nearl', targetId: 'side-near-light', relationType: 'direct_prerequisite', description: 'カジミエーシュ大騎士領三部作' },
  { id: 'e-tw-zw', sourceId: 'side-twilight-of-wolumonde', targetId: 'side-zwillingsturme-im-herbst', relationType: 'recommended_reading', description: 'リターニア貴族と冬霊の残響' }
];

export const FULL_STORY_DATASET: StoryDataset = {
  version: '1.0.0',
  nodes: [
    ...MAIN_THEME_NODES,
    ...INTERMEZZI_NODES,
    ...SIDE_STORY_NODES
  ],
  edges: STORY_EDGES
};
