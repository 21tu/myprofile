# アーキテクチャ決定記録（ADR）

## ADR-001 静的Next.js + Cloudflare
- 状態: 採用（初期設計）
- 背景: QR名刺からの高速なアクセス、低い運用負荷、営業向けの情報提示。
- 決定: Next.js App Router / TypeScript strict / `output: 'export'` / Cloudflare Workers Static Assets。
- 理由: 現時点でSSR、ログイン、DBを必要としないため。
- 制約: Server Actionsや動的なサーバー機能を初期構成に混ぜない。将来必要になれば再検討。
- 再検討条件: 認証、サーバー側問い合わせ、動的コンテンツが必要になった場合。

## ADR-002 モーションは段階的に導入
- 状態: 採用（初期設計）
- 決定: CSSとMotionを中心にHero・カード・Projectsの演出を実装。reduced-motion対応、重い3Dは初期対象外。
- 理由: 視覚的な品質とCore Web Vitals・アクセシビリティを両立するため。

## ADR-003 Claude Codeを正式レビュアーとする
- 状態: 採用
- 決定: Codexは実装と自己検査、Claude Codeが差分レビュー・承認判定・記録保守を行う。
- 理由: 実装と承認の役割を明確に分け、後から判断を追跡できるようにするため。
