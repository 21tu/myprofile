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

## ADR-005 CSP uses build-time hashes; HSTS starts without includeSubDomains

- Status: Issue #9, REV-20261024-005 F-001/F-002 implemented; Claude Code re-review pending.
- Context: Static export cannot issue per-response nonces. Next.js inline scripts and Motion SSR style attributes need exact hash allowances. Domain/subdomain operations remain unconfirmed.
- Decision: Replace ADR-004's `public/_headers` placement with postbuild generation of `out/_headers` by `npm run build`. Emit exactly one Content-Security-Policy in the global `/*` block, covering HTML, unknown-path 404 responses and assets. Union all exported pages' SHA-256 script hashes and decoded style attribute hashes, deduplicate and sort. Keep `style-src 'self'`; use CSP Level 3 `style-src-attr 'unsafe-hashes'` with only the exported attribute value hashes. Never use unsafe-inline/unsafe-eval. Preserve the 100-rule and 2,000-character line limits and fail the build on overflow. HSTS remains `max-age=31536000`, without includeSubDomains/preload.
- Reason: One global rule covers unknown URLs without Cloudflare combining duplicate CSP headers. Hashes allow only known exported inline content. The union permits each known value on every page, an intentional scope tradeoff. The earlier 14 blocked styles and missing unknown-path CSP are resolved by this change.
- Reconsider when: All domains' HTTPS operation is confirmed, SSR/API/external resources become necessary, the hash union reaches Cloudflare limits, or browser support for CSP Level 3 is insufficient. Security Team review is required. Production TLS/headers remain unverified until deployment approval.

## ADR-006 マスコットに、デザインコンセプトの画像を仮で使う（例外）
- 状態: 採用（暫定。#29 で正式画像に差し替えるまで）
- 背景: UX-002 では「マスコットは提供された素材をそのまま使い、代わりの画像を作らない」と定めている。正式画像はまだ提供されていない。2026-10-24、オーナーが「デザインコンセプトのきつねを仮で使う」と明示的に指示した。
- 決定:
  - `note/images/design-concept-dark-navy.png`（AI生成のデザインコンセプト、1024×1536）の Hero 部分を、**切り抜くだけ**で使う（x495, y146, 360×212）。形式は WebP（ロスレス）に変換するが、キャラクターの描画には手を加えない（色・形の変更、再生成、加筆をしない）。配置先は `public/mascot/fox-temp-concept.webp`。
  - 背景（夜景と机）は画像に焼き込まれているため、切り抜かずにカード状の枠の中に表示する。手書きの文字の一部が右上の角にわずかに残る（耳の先と文字の位置が縦に重なっていて、トリミングでは除けないため）。
  - コンテンツデータでは `mascot.status: 'placeholder'` とする。そのため `npm run check:content` は、正式画像に差し替えるまで失敗し続け、本番公開を止める。画面にも「仮画像」と表示する。
- 理由: オーナーの判断によって、レイアウトとモーションを実際のキャラクターで確認できるようにするため。本番に流出しないことは、既存の公開前チェックで担保する。
- リスク: AI生成画像の利用条件と権利は未確認（オーナーが確認する）。解像度が低いため、高密度ディスプレイではぼやける。
- 再検討条件: 正式画像が提供されたら、この ADR を「廃止」にして差し替える（#29）。

## ADR-007 デプロイはステージング先行、GitHub Actions + Environments の承認
- 状態: 採用（#31）
- 背景: 公開情報が仮データのままで、本番公開の条件（`check:content` が通ること）を満たしていない。それでも、スマートフォンでの実機確認やレビューのために、公開された URL がほしい。
- 決定:
  - Cloudflare Workers Static Assets に、`myprofile-staging`（workers.dev、`X-Robots-Tag: noindex, nofollow`）と `myprofile`（本番、workers.dev は無効、ルートは未設定）の 2 つの環境を用意する。
  - デプロイは `.github/workflows/deploy.yml` の手動実行だけにする。GitHub Environments（`staging` / `production`）の Required reviewers による承認を必要にする。
  - 本番は、ビルドの前に `check:content` を実行する。
  - Cloudflare の資格情報は、Environment secrets で管理する（最小権限の API トークン）。
- 理由: 自動デプロイをやめて人間の承認を必須にすると、「デプロイは承認制」（SEC-006、requirements §10）を仕組みで担保できる。ステージングは noindex にして、検索経由で流出する可能性を下げる。
- 制約とリスク: noindex はアクセス制限ではないので、URL を知っている人はステージングを見られる（仮データだけで、秘密情報は含まない）。承認者がオーナー一人なので、self-review は許可する。
- 再検討条件: 独自ドメインを決めたとき、ステージングにアクセス制限（Cloudflare Access）が必要になったとき、承認者が増えたとき。
