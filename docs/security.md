# 静的サイトのセキュリティ設計（Issue #9）

対象: SEC-001〜SEC-008、NFR-007、ADR-004/005。これは設計と検証方法の記録であり、ASVS準拠・認証を主張するものではない。本番HTTPS/TLS・ヘッダー・ブラウザ動作・MFA・権限設定は **未検証**。デプロイ承認後にSecurity Teamが確認する。

## ヘッダー

| ヘッダー | 値・目的 |
|---|---|
| Strict-Transport-Security | `max-age=31536000`。HTTPS利用を記憶。独自ドメイン未決定のためincludeSubDomains/preloadなし。本番TLSは未検証 |
| X-Content-Type-Options | `nosniff`。MIME推測を禁止 |
| Referrer-Policy | `strict-origin-when-cross-origin`。他オリジンへの参照元詳細を制限 |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`。不要な機能を禁止（ブラウザの対応範囲で有効） |
| Cross-Origin-Opener-Policy | `same-origin`。別オリジンのウィンドウとの分離 |
| X-Frame-Options | `DENY`。フレーム埋め込みを禁止 |
| Content-Security-Policy | HTMLは下記のページ別ポリシー、非HTMLは `default-src 'none'; frame-ancestors 'none'` |

## CSPの生成と配信

`npm run build` は prebuild → next build → postbuild の順に実行する。`scripts/generate-headers.mjs` が全 `out/**/*.html` のsrc属性のないscript本文を正確に抽出し、SHA-256/base64を計算して `out/_headers` を生成する。本文をtrim・HTMLデコードしない。外部依存の追加はない。生成先はADR-004の `public/_headers` から変更する（ADR-005）。手動編集した成果物は次のビルドで上書きされる。`next build` 単独ではpostbuildが動かないため、必ず `npm run build` を使う。

HTMLのCSP:

```text
default-src 'none'; script-src 'self' <ページ内scriptのsha256ハッシュ>; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
```

script-srcにunsafe-inline/unsafe-evalは使用しない。空scriptも抽出し、同一本文のハッシュはページ内で重複除去する。style属性は許可せず、生成時に検出数と値を警告する。警告は解消済みと扱わず、ブラウザでの影響を別途確認する。

[Cloudflareの仕様](https://developers.cloudflare.com/workers/static-assets/headers/)では一致した全ルールのヘッダーが適用され、同名値はカンマ結合される。このため共通 `/*` にCSPを置かない。`/`・`/index.html`、`/404`・`/404.html`、他のHTMLの拡張子あり/なし、ディレクトリindexのエイリアスにページ別CSPを生成する。`/_next/*` と、その他の実在する非HTMLファイルの完全一致パスに厳格なアセットCSPを生成する。重複するHTMLパス、100ルール超、1行2,000文字超は生成エラーにする。

未知のURLやHTML正規化のリダイレクトは完全一致ルールの対象外になり得る。特に未知URLの404応答へのページ別CSPはこの静的ルールでは保証しない。既知HTML・アセットとともに本番の404/リダイレクトも確認し、必要なら別の設計をレビューする。

## ASVS 5.0 章単位の適用判断

[OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0/en)を参照。Applicableは章内の関連項目を評価する意味であり、章の全要件が適用または検証済みという意味ではない。N/Aは現在の静的サイトの範囲に限る。

| 章 | 判定 | 理由 |
|---|---|---|
| V1 Encoding and Sanitization | Applicable | Reactの出力エスケープ、URL・vCardの安全な出力を評価 |
| V2 Validation and Business Logic | Applicable | 公開設定の検証、placeholder公開防止を評価 |
| V3 Web Frontend Security | Applicable | CSP・ブラウザヘッダー・外部リンクを評価 |
| V4 API and Web Service | N/A | API・Webサービスなし |
| V5 File Handling | Applicable | 静的ファイルの公開範囲と生成vCardのダウンロードを評価。アップロードなし |
| V6 Authentication | N/A | サイトのユーザー認証なし。運用者MFAは別途SEC-006で確認 |
| V7 Session Management | N/A | アプリケーションのセッションなし |
| V8 Authorization | N/A | 保護リソース・ユーザー別権限なし |
| V9 Self-contained Tokens | N/A | JWT等のトークンなし |
| V10 OAuth and OIDC | N/A | OAuth/OIDC連携なし |
| V11 Cryptography | Applicable | CSPのSHA-256利用を評価。秘密鍵や暗号化データの管理なし |
| V12 Secure Communication | Applicable | CloudflareでのHTTPS/TLS・HSTSを評価。本番は未検証 |
| V13 Configuration | Applicable | 静的配信・秘密情報除外・依存管理の設定を評価 |
| V14 Data Protection | Applicable | 公開プロフィール・連絡先と秘密情報の公開可否を評価 |
| V15 Secure Coding and Architecture | Applicable | 静的構成・依存・安全な実装・レビューを評価 |
| V16 Security Logging and Error Handling | Applicable | 静的404とホスティングのエラー・ログ/PII取扱いを評価。運用設定は未検証 |
| V17 WebRTC | N/A | WebRTCなし |

## NIST SSDFとの対応

[NIST SP 800-218 SSDF](https://csrc.nist.gov/pubs/sp/800/218/final)の実践カテゴリへの参考マッピングであり、全実践の充足を意味しない。

| カテゴリ | リポジトリの対応物 |
|---|---|
| PO Prepare the Organization | `AGENTS.md`、`docs/requirements.md`、`docs/review-policy.md`で役割・要件・品質ゲートを定義 |
| PS Protect the Software | `.gitignore`で秘密ファイル除外、`.github/workflows/quality.yml`でActionsのSHA固定。保護ルール・MFAは未検証 |
| PW Produce Well-Secured Software | ADR、CSP生成処理、`tests/unit/csp.test.ts`、CIのformat/lint/typecheck/test/buildで設計・検証 |
| RV Respond to Vulnerabilities | CIの`npm audit --omit=dev --audit-level=high`、GitHub Issue、`docs/review-policy.md`による修正・再レビュー追跡 |

`.env*`（`.env.example`を除く）と `.dev.vars` はGitから除外する。これは既存Git履歴や成果物のsecret scanの代替ではない。秘密はNEXT_PUBLIC変数やクライアント成果物に入れない。SEC-005の監査、SEC-006のMFA/最小権限/承認、SEC-007のリンク安全性は個別に確認し、SEC-008の問い合わせAPI追加時は設計を再レビューする。

## ローカル検証

```sh
npm run build && npm run preview
```

別ターミナルで（標準ポート8787、Windows PowerShellでは `curl.exe`）:

```sh
curl -sI http://127.0.0.1:8787/
curl -sI http://127.0.0.1:8787/404
curl -sI http://127.0.0.1:8787/_next/static/<実在するアセットのパス>
```

各最終応答でCSPが1個であり、カンマで複数ポリシーが結合されていないこと、共通ヘッダーが返ることを確認する。`/index.html`等のリダイレクトはLocationを確認し、遷移先のヘッダーを検査する。ブラウザでもscript/styleのCSP違反を確認する。ローカルHTTPは本番TLS/HSTSの有効性を検証しない。本番チェックは **未検証**。

## 実装検証記録（2026-10-24 JST）

環境: Windows、Node.js v22.14.0、Wrangler 4.152.0。npmは`npm.cmd`を使用し、`npm_config_cache`をOSのTEMP配下に設定。コミット・push・デプロイは実行していない。正式承認はClaude Codeが行う。

| コマンド | 終了コード | 実出力の抜粋 |
|---|---|---|
| `npm run format:check` | 0 | `All matched files use Prettier code style!` |
| `npm run lint` | 0 | `eslint . --max-warnings=0`（診断なし） |
| `npm run typecheck` | 0 | `tsc --noEmit`（診断なし） |
| `npm test` | 0 | `Test Files 6 passed (6)` / `Tests 32 passed \u007c 1 skipped (33)`。CSPの7テストを含む |
| `npm run build` | 0 | `Compiled successfully` / `postbuild` / `Generated out/_headers for 3 HTML pages`。ファイル存在確認・全文出力済み |
| Node.js + JSDOM + node:cryptoによる全成果物照合 | 0 | `404.html: 3 inline scripts independently verified; styles=0` / `index.html: 3 inline scripts independently verified; styles=14` / `_not-found.html: 3 inline scripts independently verified; styles=0` |
| `npm audit --omit=dev --audit-level=high` | 0 | `found 0 vulnerabilities` |
| `git diff --check` | 0 | 出力なし |

全成果物照合では生成器の抽出・ハッシュ関数を使わず、JSDOMの`script:not([src])`とnode:cryptoで独立計算し、対応するHTMLルール内のハッシュを照合した。アセットを含め17ルールが生成された。

`npx --no-install wrangler dev --local --port 8787`はバックグラウンドセッションで起動。ユーザーディレクトリ内ログへの書き込みは`EPERM`だったが、サーバー起動・配信は成功し、次の実ログを確認した。検証後にCtrl+Cで停止（停止時のプロセス終了コード1）。

```text
[wrangler:info] ✨ Parsed 17 valid header rules.
[wrangler:info] Ready on http://127.0.0.1:8787
```

`curl.exe -sI --max-time 10`の結果（各curl終了コード0、CSP数は大文字小文字を区別せずカウント）:

| URLパス | HTTPステータス | CSPヘッダー数 | 備考 |
|---|---|---|---|
| `/` | 200 | 1 | 下記のHTMLポリシー |
| `/_next/static/chunks/0009q67pk766q.css` | 200 | 1 | `default-src 'none'; frame-ancestors 'none'` |
| `/404` | 200 | 1 | 404ページ用の3ハッシュ |
| `/index.html` | 307 | 1 | `Location: /` |
| `/missing-test` | 404 | 0 | 未知パスの制約を実測。共通ヘッダーは返る |

`/`の実応答:

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
Strict-Transport-Security: max-age=31536000
content-security-policy: default-src 'none'; script-src 'self' 'sha256-KEp5EkMBAosaxeEDxM/vCF9mNZRqoSv+nQDh1ViCE04=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-tyf6z5nD7PQpb/pLKgRJGg8d9bBkdNIOu5Z2pJqJBFQ='; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
cross-origin-opener-policy: same-origin
permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: DENY
```

CSSアセットの実応答（両応答ともCSPのカンマ結合なし）:

```text
HTTP/1.1 200 OK
Content-Type: text/css; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
Strict-Transport-Security: max-age=31536000
content-security-policy: default-src 'none'; frame-ancestors 'none'
cross-origin-opener-policy: same-origin
permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: DENY
```

既存`index.html`のインラインstyle属性14件は指定の`style-src 'self'`でブロックされる。実出力の値は`transform:none`（2件）、`--i:0`〜`--i:5`（6件）、`transform:scaleY(0)`（1件）、`opacity:1`（1件）、`opacity:0`（4件）。見た目・モーションへの影響は未検証。CSPの緩和やUIの変更は行っていない。

未検証: PlaywrightによるブラウザCSP違反確認、手動UI/a11y、secret scan、本番TLS/ヘッダー、運用者MFA/権限・ブランチ保護。依存監査はproduction依存のみ。Draft PRはcommit/push禁止のため作成していない。正式レビュー・承認待ち。
