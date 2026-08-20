<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1
- Ratified Date: 2026-08-20
- Last Amended Date: 2026-08-20
- Principles defined:
  - 第1原則: ライブラリファーストと高モジュール性 (Library-First & Modularity)
  - 第2原則: テスト駆動開発と品質保証 (Test-First & Quality Assurance)
  - 第3原則: 厳格な型安全性と静的解析 (Strict Type Safety & Static Analysis)
  - 第4原則: シンプル原則と保守性 (Simplicity & Maintainability)
- Added sections:
  - 技術スタックと標準基準 (Technical Stack & Standards)
  - 開発ワークフローと品質ゲート (Development Workflow & Quality Gates)
- Removed sections: None
- Deferred items: None
-->

# Arknights プロジェクト憲章 (Constitution)

## コア原則 (Core Principles)

### 第1原則: ライブラリファーストと高モジュール性 (Library-First & Modularity)
- すべての機能は、アプリケーションやUIに統合する前に、独立して疎結合なモジュールまたはライブラリとして設計・実装しなければならない（MUST）。
- 各モジュールは自己完結し、単体でテスト可能であり、明示的でクリーンな公開インターフェースを提供しなければならない（MUST）。
- コアドメインロジック、データアクセス層、API・UI表示層の間で関心の分離を徹底しなければならない（MUST）。
- **理由 (Rationale)**: ビジネスロジックをUIや通信プロトコルから切り離すことで、再利用性と長期的な保守性を担保し、密結合を防ぐため。

### 第2原則: テスト駆動開発と品質保証 (Test-First & Quality Assurance)
- すべてのビジネスロジックおよびドメインロジックにおいて、テスト駆動開発（TDD）を実践しなければならない（MUST）。（テストを先に作成 → 失敗を確認 → 実装してパスさせる Red-Green-Refactor サイクルを徹底）。
- ユニットテストおよび契約テストにより、すべてのクリティカルパスおよび境界値・エッジケースを網羅しなければならない（MUST）。
- 単体テストは外部依存を持たず、高速かつ決定論的（再現可能）に実行されなければならない（MUST）。
- **理由 (Rationale)**: テストファーストにより明確なインターフェース設計を強制し、開発の初期段階からリグレッション（先祖返り）を防止するため。

### 第3原則: 厳格な型安全性と静的解析 (Strict Type Safety & Static Analysis)
- コードベース全体で TypeScript の Strict モード（`strict: true`、`noImplicitAny: true` など）を有効化しなければならない（MUST）。
- `any` 型の使用は原則禁止とし、型が不確定な場合は `unknown`、ジェネリクス、または明示的なスキーマバリデーションを使用しなければならない（MUST）。
- 自動リンター（ESLint）およびフォーマッター（Prettier）によるチェックは、CIおよびコミット前検査で警告ゼロ（Zero Warnings）で通過しなければならない（MUST）。
- **理由 (Rationale)**: コンパイル時の型検証により実行時エラーを排除し、コードの自動補完やドキュメント性を最大化するため。

### 第4原則: シンプル原則と保守性 (Simplicity & Maintainability)
- KISS原則（Keep It Simple, Stupid）および YAGNI原則（You Aren't Gonna Need It）を遵守しなければならない（MUST）。
- 過度な抽象化や不必要な早期最適化を避け、明瞭で理解しやすいコードを最優先しなければならない（MUST）。
- 自明でない設計判断や公開APIには、目的と背景を明記したドキュメントを付与しなければならない（MUST）。
- **理由 (Rationale)**: シンプルで予測可能性の高いコードベースは、レビュー、デバッグ、リファクタリング、拡張が容易であるため。

## 技術スタックと標準基準 (Technical Stack & Standards)

- **言語・ランタイム**: TypeScript / Node.js (LTS版)
- **テストフレームワーク**: Vitest または Jest（高い再現性と実行速度）
- **品質管理**: ESLint、Prettier、TypeScript Strict コンパイラチェック
- **ディレクトリ構造**: 機能および関心事ごとにクリーンな境界を保つ（例: `src/core`, `src/services`, `src/api`）

## 開発ワークフローと品質ゲート (Development Workflow & Quality Gates)

- **仕様駆動開発 (Spec-Driven Development)**: 新機能および大規模変更は、Spec Kit の開発サイクル（仕様定義 → 実装計画 → タスク分割 → 実装）に厳格に従わなければならない（MUST）。
- **品質ゲート**: すべての変更は、マージ前に自動テスト、型チェック、リント検査の全パスを必須とする（MUST）。
- **コミット規約**: Gitコミットメッセージは Conventional Commits 形式（`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`）に従うことを推奨する（SHOULD）。

## ガバナンス (Governance)

- 本憲章は、アドホックな開発慣習に優先し、本リポジトリにおけるエンジニアリングの基本基準を定めたものである。
- 本憲章の改定には、明確な理由の提示、レビュー、およびセマンティックバージョニングに基づくバージョン更新が必要である。
- **バージョン規則**:
  - **メジャー (x.0.0)**: ガバナンスの大幅改定、またはコア原則の削除・根本的再定義
  - **マイナー (1.x.0)**: 新しい原則の追加や技術標準の実質的な拡充
  - **パッチ (1.0.x)**: 文言の明確化、表現の修正、非セマンティックな微調整

**Version**: 1.0.1 | **Ratified**: 2026-08-20 | **Last Amended**: 2026-08-20
