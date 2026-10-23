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

## ADR-004 アプリ構成・プロフィール設定データ・Cloudflare配信
- 状態: 採用（#13、#6 で実装）
- 背景: ADR-001 の静的構成を、実装できる粒度まで決める必要がある。公開情報（名前・連絡先・実績）は未確定（requirements §12）。
- 決定:
  - **構成:** `src/app`（ページとレイアウト）、`src/components`（UI）、`src/config`（型付きのコンテンツデータ）、`src/lib`（純粋関数）、`tests/unit`（Vitest）、`tests/e2e`（Playwright）。中身のない抽象レイヤーは作らない。
  - **スタック:** Next.js App Router、TypeScript strict、Tailwind CSS、Motion for React。Node.js 22 で開発・CIを行う。
  - **コンテンツ:** プロフィール・サービス・スキル・実績・連絡先は `src/config/` の型付きデータで管理する。項目ごとに `status: 'confirmed' | 'placeholder'` を持たせる。
    - `placeholder` の項目は画面に「サンプル」と表示する。
    - 本番公開前のチェック（`npm run check:content`）は、`placeholder` が1件でも残っていれば失敗する。
    - 連絡先は、確定した値がない限りリンクを出さない。
  - **マスコット:** きつねの画像は提供されるまで作らない。差し替え用の枠だけを置く（UX-002）。
  - **配信:** `output: 'export'` で `out/` を生成し、`wrangler.jsonc` の `assets.directory` で Cloudflare Workers Static Assets から配信する（Worker スクリプトなし）。画像は `images.unoptimized`。
  - **セキュリティヘッダー:** `public/_headers` に定義し、Static Assets で配信する。静的エクスポートでは nonce が使えないため、CSP のインラインスクリプトはビルド後にハッシュで許可する方式を #9 で検討する。`unsafe-eval` は使わない。
- 理由: 未確定の情報を、架空のデータとして本番に出さない仕組みをコードで担保するため。Worker スクリプトを持たない構成は、攻撃対象と運用負荷が最小になる。
- 再検討条件: 問い合わせフォーム、SSR、CMS が必要になった場合。CSP のハッシュ方式が保守しきれない場合。

## ADR-005 CSP はビルド後のハッシュ方式、HSTS は includeSubDomains なしで開始

- 状態: Issue #9 のSecurity Team指定設計を実装。正式レビュー待ち。
- 背景: 静的エクスポートでは応答ごとのnonceを発行できず、Next.jsが出力するインラインscriptを許可する必要がある。独自ドメインとサブドメインの運用条件は未確定。
- 決定: ADR-004のヘッダー配置を更新し、`public/_headers`ではなく`npm run build`のpostbuildで全HTML本文からSHA-256を計算して`out/_headers`を生成する。script-srcにunsafe-inline/unsafe-evalを使わない。共通`/*`にCSPは置かず、HTMLのパス別CSPと非HTMLの厳格CSPを分離する。HSTSは`max-age=31536000`で開始し、includeSubDomains/preloadを付けない。
- 理由: ビルドごとに変わるscript本文に正確に対応し、Cloudflareの同名ヘッダー結合による複数CSPを避ける。未確認のサブドメインへのHTTPS強制やpreload登録を推測で行わない。
- 再検討条件: ドメインと全サブドメインのHTTPS運用が確認できた場合、SSR/API/外部リソースが必要になった場合、未知URLの404にもページ別CSPが必要な場合、Cloudflareの100ルール/1行2,000文字制限に達した場合。変更はSecurity Teamのレビューを受ける。本番のTLS・ヘッダーはデプロイ承認後に検証し、現在は未検証。
