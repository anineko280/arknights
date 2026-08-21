# 実装計画書: ストーリーのフローチャート (Story Flowchart)

**Branch**: `001-story-flowchart` | **Date**: 2026-08-20 | **Spec**: [spec.md](file:///Users/anineko280/work/arknights/specs/001-story-flowchart/spec.md)

**Input**: Feature specification from `/specs/001-story-flowchart/spec.md`

## 概要 (Summary)

アークナイツの全ストーリー（メインテーマ、サイドストーリー、幕間、オムニバス）の時系列・前提関係を可視化するインタラクティブ2Dグラフキャンバスと、読了進行度管理・ネタバレ防止・JSONバックアップ機能を備えたWebアプリケーションおよびコアライブラリモジュールを実装します。

---

## 技術コンテキスト (Technical Context)

- **言語 / バージョン**: TypeScript 5.x / Node.js 20+ (LTS)
- **主要依存ライブラリ**:
  - ビルドツール / フレームワーク: Vite + Vanilla/モダンコンポーネント構成
  - グラフ描画 / インタラクション: SVG 2D Canvas + d3-zoom / custom pan-zoom engine
  - アイコン: Lucide Icons
- **データ永続化**: Browser LocalStorage + JSONスキーマによるエクスポート/インポート
- **テスト基盤**: Vitest（単体テスト・契約テスト・グラフアルゴリズム検証）
- **対象プラットフォーム**: モダンWebブラウザ（Chrome, Safari, Edge, Firefox, モバイルブラウザ対応）
- **プロジェクト種別**: コアライブラリ（`src/core/`） + シングルページWebアプリケーション（`src/ui/`）
- **パフォーマンス目標**: 初回レンダリング < 1秒、キャンバスズーム/パン 60fps、データインポート/エクスポート < 2秒
- **制約事項**: 外部サーバー非依存（100% クライアント完結・オフライン動作）、TypeScript Strictモード、UI完全日本語化

---

## 憲章チェック (Constitution Check)

*GATE: 憲章（Constitution v1.0.1）に基づく検証*

1. **第1原則: ライブラリファーストと高モジュール性**
   - **判定**: **PASS**
   - **理由**: ストーリーグラフのデータ構造・トポロジカルソート・推奨アルゴリズム・進捗管理ロジックを `src/core/` に完全独立したモジュールとして実装し、UI層から疎結合に保つ。
2. **第2原則: テスト駆動開発と品質保証 (TDD)**
   - **判定**: **PASS**
   - **理由**: データセット検証、グラフ探索・前提判定、LocalStorage永続化、JSONインポート/エクスポートについて、テストを先行作成（Red-Green-Refactor）して実装する。
3. **第3原則: 厳格な型安全性と静的解析**
   - **判定**: **PASS**
   - **理由**: `tsconfig.json` の `strict: true`、`any`禁止、ESLint / Prettier による厳格な静的検証を実施。
4. **第4原則: シンプル原則と保守性 (KISS / YAGNI)**
   - **判定**: **PASS**
   - **理由**: 過剰なバックエンドサーバーや複雑なフレームワークを排し、必要十分な軽量アーキテクチャで構築。

---

## プロジェクト構造 (Project Structure)

### ドキュメント（本機能）

```text
specs/001-story-flowchart/
├── spec.md              # 機能仕様書
├── checklists/
│   └── requirements.md  # 仕様品質チェックリスト
├── plan.md              # 本実装計画書
├── research.md          # 技術調査と設計決定
├── data-model.md        # データモデル設計書
├── quickstart.md        # クイックスタート・検証ガイド
├── contracts/           # 公開インターフェース契約
│   ├── story-graph-contract.ts
│   └── progress-storage-contract.ts
└── tasks.md             # 次フェーズ（/speckit-tasks）で生成
```

### ソースコード構造 (Source Code Structure)

```text
/Users/anineko280/work/arknights/
├── index.html                   # エントリーHTML
├── package.json                 # プロジェクト構成・依存関係
├── tsconfig.json                # TypeScript設定 (Strictモード)
├── vite.config.ts               # Vite設定
├── src/
│   ├── index.ts                 # アプリケーション起動エントリー
│   ├── index.css                # デザインシステム・スタイル（アークナイツ調ダークテーマ）
│   ├── core/                    # [第1原則: コアライブラリモジュール]
│   │   ├── types.ts             # 共通型定義
│   │   ├── data/                # ストーリー静的データセット
│   │   │   ├── main-theme.ts    # メインテーマデータ (0章〜14章+)
│   │   │   ├── intermezzi.ts    # 幕間・エピソードデータ (闇夜に生きる, 遺塵の道を 等)
│   │   │   ├── side-stories.ts  # サイドストーリーデータ (騎兵と狩人, 孤星 等)
│   │   │   └── dataset.ts       # 統合データセット
│   │   ├── graph/               # グラフアルゴリズム・探索エンジン
│   │   │   ├── graph-engine.ts  # 前提条件判定・推奨ストーリー計算・フィルタリング
│   │   │   └── layout.ts        # 時系列レーン自動配置ロジック
│   │   └── storage/             # 永続化・バックアップ
│   │       ├── storage-service.ts # LocalStorage管理
│   │       └── backup-validator.ts # JSONインポート検証
│   └── ui/                      # プレゼンテーション層
│       ├── components/
│       │   ├── canvas/          # 2Dインタラクティブグラフキャンバス
│       │   │   ├── canvas.ts
│       │   │   ├── node-view.ts
│       │   │   └── edge-view.ts
│       │   ├── detail-panel/    # ノード詳細・読了チェック・ネタバレ表示
│       │   │   └── detail-panel.ts
│       │   ├── filter-bar/      # 分類/陣営/時系列フィルター・検索バー
│       │   │   └── filter-bar.ts
│       │   └── backup-modal/    # JSONエクスポート/インポートモーダル
│       │       └── backup-modal.ts
│       └── app.ts               # UI統合コントローラー
└── tests/                       # [第2原則: 自動テストスイート]
    ├── unit/
    │   ├── graph-engine.test.ts # グラフ探索・推奨順テスト
    │   ├── dataset.test.ts      # データセット整合性テスト
    │   ├── storage.test.ts      # ストレージ永続化テスト
    │   └── backup.test.ts       # JSONエクスポート/インポート検証テスト
    └── integration/
        └── flowchart-flow.test.ts # 総合シナリオテスト
```

**構造決定の根拠**:
憲章の「ライブラリファースト」に基づき、UIに依存しない独立したドメインロジックを `src/core/` に集約し、プレゼンテーション層 `src/ui/` と完全に分離します。これにより、ビジネスロジックの100%自動テストと将来的な他プラットフォーム（CLI、他UI）への再利用性を担保します。

---

## 複雑性の追跡 (Complexity Tracking)

> 憲章違反はなく、すべて基準内でシンプルに設計されています。

| 項目 | 採用理由 | 却下した代替案とその理由 |
| :--- | :--- | :--- |
| **Vanilla TS + Vite** | 最速のレンダリング速度、余計な仮想DOMオーバーヘッドなし | 重大なフレームワーク（Next.js等）は静的SPAには過剰 |
| **SVG 2Dキャンバス** | 高解像度・CSSアニメーション・シンプルなDOM操作 | WebGL等はデータ規模（数百ノード）に対して不要な複雑性 |
| **LocalStorage + JSON** | ログイン不要で即座に保存・移行可能 | リモートDBサーバーは保守コストとオフライン非対応のため不採用 |
