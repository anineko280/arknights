# 実装タスク一覧: ストーリーのフローチャート (Story Flowchart)

**Branch**: `001-story-flowchart` | **Date**: 2026-08-21 | **Spec**: [spec.md](file:///Users/anineko280/work/arknights/specs/001-story-flowchart/spec.md) | **Plan**: [plan.md](file:///Users/anineko280/work/arknights/specs/001-story-flowchart/plan.md)

---

## Phase 1: Setup（プロジェクト初期構築と共通基盤）

**目的**: プロジェクト開発環境の初期化、ビルド構成、TypeScript Strict設定、CSSデザインシステムの構築

- [X] T001 プロジェクト初期設定（`package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`）
- [X] T002 [P] リンター・フォーマッター設定（`.eslintrc.cjs`, `.prettierrc`）
- [X] T003 [P] CSSデザインシステム基盤の作成（`src/index.css` - アークナイツ調ダークテーマ、カラーパレット、タイポグラフィ、アニメーション）
- [X] T004 [P] アプリケーションHTMLエントリーポイントの作成（`index.html`）

---

## Phase 2: Foundational（共通ドメインモデル・データセット定義）

**目的**: 全ユーザーストーリーが依存する共通型定義およびアークナイツストーリー静的データセットの構築

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの実装は開始できません

- [X] T005 [P] コア型定義の作成（`src/core/types.ts` - StoryNode, StoryEdge, UserProgress, UserSettings, ProgressBackupData）
- [X] T006 [P] メインテーマデータセットの作成（`src/core/data/main-theme.ts` - 0章〜14章）
- [X] T007 [P] 幕間・エピソードデータセットの作成（`src/core/data/intermezzi.ts` - 闇夜に生きる、遺塵の道を 等）
- [X] T008 [P] サイドストーリーデータセットの作成（`src/core/data/side-stories.ts` - 騎兵と狩人、孤星 等）
- [X] T009 統合データセットおよびエッジ関連定義の作成（`src/core/data/dataset.ts`）
- [X] T010 [P] データセット整合性・循環依存なし検証テスト（`tests/unit/dataset.test.ts`）

**チェックポイント**: データセットと型基盤が完成し、ユーザーストーリーの実装に進むことができます。

---

## Phase 3: User Story 1 - ストーリー全体フローチャートの閲覧と推奨順確認 (Priority: P1) 🎯 MVP

**ゴール**: メインおよび各イベントストーリーの時系列・前提関係を2Dグラフキャンバス上で閲覧・ズーム/パン操作し、次に読むべき推奨ストーリーを把握できるようにする。

**独立テスト基準**: `tests/unit/graph-engine.test.ts` がパスし、ブラウザ上で2Dキャンバス上に全ノードと接続線が描画され、クリック時に前提条件がハイライト表示されること。

### テスト (TDD)
- [X] T011 [P] [US1] グラフ探索エンジンおよび推奨順計算の単体テスト（`tests/unit/graph-engine.test.ts`）

### 実装
- [X] T012 [US1] グラフ探索・前提判定・推奨ストーリー抽出エンジンの実装（`src/core/graph/graph-engine.ts`）
- [X] T013 [P] [US1] 時系列レーン自動配置ロジックの実装（`src/core/graph/layout.ts`）
- [X] T014 [P] [US1] SVGノードおよびエッジ描画コンポーネントの実装（`src/ui/components/canvas/node-view.ts`, `src/ui/components/canvas/edge-view.ts`）
- [X] T015 [US1] 2Dインタラクティブキャンバス（ズーム/パン/ノード選択/ハイライト）の実装（`src/ui/components/canvas/canvas.ts`）
- [X] T016 [US1] ノード概要・前提ストーリー表示サイドパネルの実装（`src/ui/components/detail-panel/detail-panel.ts`）
- [X] T017 [US1] MVP統合コントローラーの実装（`src/ui/app.ts`, `src/index.ts`）

**チェックポイント**: User Story 1 (MVP) が単体で完全に動作・検証可能です。

---

## Phase 4: User Story 2 - 進行度・閲覧済み管理とネタバレ防止 (Priority: P2)

**ゴール**: ストーリーの読了状態をLocalStorageに記録・更新し、ネタバレ防止マスク機能と進捗率表示を提供する。

**独立テスト基準**: `tests/unit/storage.test.ts` がパスし、ノード読了時に視覚的に区別され、ネタバレトグルON時に未読ノードのあらすじがマスクされること。

### テスト (TDD)
- [X] T018 [P] [US2] ストレージ永続化サービスの単体テスト（`tests/unit/storage.test.ts`）

### 実装
- [X] T019 [US2] LocalStorage進捗・設定永続化サービスの実装（`src/core/storage/storage-service.ts`）
- [X] T020 [US2] ネタバレ防止マスクおよび読了状態トグルUIを詳細パネルに統合（`src/ui/components/detail-panel/detail-panel.ts`）
- [X] T021 [US2] ヘッダー進捗率バーおよび推奨ストーリー通知バッジの実装（`src/ui/components/header/header.ts`）

**チェックポイント**: User Story 1 および 2 が連携して動作します。

---

## Phase 5: User Story 3 - カテゴリ・陣営・時系列フィルタリング (Priority: P3)

**ゴール**: 「メインのみ」「サイドのみ」「陣営別（カズデル、ヴィクトリア等）」「時系列順/公開順」の絞り込みとキーワード検索を可能にする。

**独立テスト基準**: フィルター選択やキーワード入力時に、条件に合致するストーリーノードのみがキャンバス上で即座に抽出・ハイライトされること。

### テスト (TDD)
- [X] T022 [P] [US3] グラフフィルタリングおよび検索エンジンの単体テスト（`tests/unit/filter.test.ts`）

### 実装
- [X] T023 [US3] グラフエンジンへの高度フィルタリング・キーワード検索処理の追加（`src/core/graph/graph-engine.ts`）
- [X] T024 [US3] フィルターバーおよび検索ボックスUIコンポーネントの実装（`src/ui/components/filter-bar/filter-bar.ts`）
- [X] T025 [US3] フィルターバーとキャンバス表示の連携統合（`src/ui/app.ts`）

**チェックポイント**: すべての絞り込み・検索条件が正常に機能します。

---

## Phase 6: User Story 4 - 進捗データのバックアップと復元 (Priority: P3)

**ゴール**: 読了進捗データをJSONファイルとしてエクスポート/インポートし、端末間移行やバックアップを可能にする。

**独立テスト基準**: `tests/unit/backup.test.ts` がパスし、モーダルからJSONダウンロードとファイル読み込み・データ復元が正常に完了すること。

### テスト (TDD)
- [X] T026 [P] [US4] JSONエクスポート/インポート検証の単体テスト（`tests/unit/backup.test.ts`）

### 実装
- [X] T027 [US4] JSONスキーマバリデーターとエクスポート/インポート処理の実装（`src/core/storage/backup-validator.ts`）
- [X] T028 [US4] バックアップ・復元モーダルUIの実装（`src/ui/components/backup-modal/backup-modal.ts`）
- [X] T029 [US4] バックアップモーダルとアプリ全体のステート同期統合（`src/ui/app.ts`）

**チェックポイント**: 全てのユーザーストーリーが独立して動作・完結します。

---

## Phase 7: Polish & Cross-Cutting Concerns（品質仕上げと総合検証）

**目的**: アークナイツ調UIの洗練、アニメーション、レスポンシブ最適化、統合テスト、検証ガイド実施

- [X] T030 [P] アークナイツ世界観に合わせたUIエフェクト・マイクロインタラクション調整（`src/index.css`）
- [X] T031 [P] 総合統合シナリオテストの実装（`tests/integration/flowchart-flow.test.ts`）
- [X] T032 クイックスタートガイド検証の実行と最終確認（`specs/001-story-flowchart/quickstart.md`）

---

## 依存関係と実行順序 (Dependencies & Execution Order)

### フェーズ依存関係

- **Setup (Phase 1)**: 依存なし。直ちに開始可能。
- **Foundational (Phase 2)**: Phase 1 完了後に実行。全ユーザーストーリーの前提条件。
- **User Story 1 (Phase 3 - MVP)**: Phase 2 完了後に実行。
- **User Story 2 (Phase 4)**: Phase 3 完了後に実行（または並行可能）。
- **User Story 3 (Phase 5)**: Phase 3 完了後に実行。
- **User Story 4 (Phase 6)**: Phase 4 完了後に実行。
- **Polish (Phase 7)**: 全ユーザーストーリー完了後に実行。

### 並行実行の機会

- **Phase 1**: T002, T003, T004 は並行実行可能。
- **Phase 2**: T005, T006, T007, T008 は並行作成可能。
- **Phase 3**: T011（テスト）, T013（レイアウト）, T014（描画パーツ）は並行開発可能。
- **Phase 7**: T030, T031 は並行実行可能。

---

## 実装戦略 (Implementation Strategy)

1. **MVP First**: Phase 1 → Phase 2 → Phase 3（User Story 1）まで完了させ、フローチャート閲覧の基本機能を最速で動作確認・検証。
2. **Incremental Delivery**: Phase 4（進捗管理・ネタバレ防止）→ Phase 5（フィルター・検索）→ Phase 6（JSONバックアップ）の順で機能拡張。
3. **TDDの徹底**: コアロジック（グラフ、永続化、バックアップ）はテスト先行で作成し、Greenを確認しながら進める。
