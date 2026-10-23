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
| Content-Security-Policy | Single global `/*` CSP for all HTML, unknown-path 404 responses and assets |

## CSP generation and delivery

`npm run build` runs prebuild, next build and postbuild. `scripts/generate-headers.mjs` reads all `out/**/*.html` and generates `out/_headers`, replacing ADR-004's `public/_headers`. Do not edit generated output. Inline script text is hashed exactly without trimming or HTML decoding. The existing JSDOM parser extracts style attribute values, decoding named and numeric HTML entities before SHA-256/base64 hashing, without executing scripts. Generation logs attribute counts and unique value counts at info level.

Exactly one Content-Security-Policy is emitted in the global `/*` block. Script and style attribute hashes are unions across all exported pages, deduplicated and sorted for deterministic output. There are no per-path or asset CSP rules. This covers unknown-path 404 responses served by `not_found_handling` and avoids duplicate header combination under [Cloudflare header matching](https://developers.cloudflare.com/workers/static-assets/headers/).

```text
default-src 'none'; script-src 'self' <all exported script hashes>; style-src 'self'; style-src-attr 'unsafe-hashes' <all decoded exported style attribute hashes>; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
```

CSP Level 3 `style-src-attr` permits exactly the known hashed attribute values; `style-src 'self'` remains in force for stylesheets and style elements. No unsafe-inline or unsafe-eval is used. Known hashes are allowed globally, an intentional tradeoff to cover unknown-path 404s. Older browsers lacking style-src-attr support may block inline attributes. The generator throws on more than 100 rules or lines longer than 2,000 characters, without splitting or truncating the policy.

History: REV-20261024-005 F-001/F-002 identified 14 blocked index.html style attributes and missing CSP on unknown-path 404s. Both are resolved by this change. Browser UI/motion behavior and production deployment remain unverified.

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
curl -sI http://127.0.0.1:8787/nope
curl -sI http://127.0.0.1:8787/_next/static/<実在するアセットのパス>
```

各最終応答でCSPが1個であり、カンマで複数ポリシーが結合されていないこと、共通ヘッダーが返ることを確認する。`/index.html`等のリダイレクトはLocationを確認し、遷移先のヘッダーを検査する。ブラウザでもscript/styleのCSP違反を確認する。ローカルHTTPは本番TLS/HSTSの有効性を検証しない。本番チェックは **未検証**。

## Verification history

The previous 2026-10-24 run used per-path CSP: index.html had 14 blocked style attributes and `/missing-test` returned 404 without CSP. REV-20261024-005 F-001/F-002 are addressed by this change; those historical results do not describe the current policy.

## REV-20261024-005 verification

Environment: Windows, Node.js v22.14.0, Wrangler 4.152.0. npm cache was directed to OS TEMP, outside the repository. No commit, push, merge or deployment was performed. Claude Code re-review remains pending.

| Command | Exit code | Real output summary |
|---|---|---|
| `npm run format:check` | 0 | `All matched files use Prettier code style!` |
| `npm run lint` | 0 | `eslint . --max-warnings=0`, no diagnostics |
| `npm run typecheck` | 0 | `tsc --noEmit`, no diagnostics |
| `npm test` | 0 | `Test Files 6 passed (6)`; `Tests 37 passed` with `1 skipped (38)` |
| `npm run build` (final standalone run) | 0 | `Compiled successfully in 2.2s`; `Generated out/_headers for 3 HTML pages` |
| `git diff --check` | 0 | No whitespace errors |

An accidental overlapping build failed with `Another next build process is already running`; the other invocation was interrupted. The final standalone build above succeeded.

Postbuild output:

```text
404.html: 0 inline style attributes, 0 unique values allowed by style-src-attr hashes
_not-found.html: 0 inline style attributes, 0 unique values allowed by style-src-attr hashes
index.html: 14 inline style attributes, 10 unique values allowed by style-src-attr hashes
Generated out/_headers for 3 HTML pages
```

`out/_headers` contains one `/*` rule and one CSP; its longest line is 1,057 characters (hash lists abbreviated only in this display):

```text
/*
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'none'; script-src 'self' <hash list truncated>; style-src 'self'; style-src-attr 'unsafe-hashes' <hash list truncated>; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
```

Started `npx --no-install wrangler dev --local --port 8787` in a background session. Wrangler reported a log-file `EPERM` outside the workspace, but served successfully:

```text
[wrangler:info] Parsed 1 valid header rule.
[wrangler:info] Ready on http://127.0.0.1:8787
```

`curl.exe -sI --max-time 10` results (CSP names counted case-insensitively):

| Path | curl exit | HTTP status | CSP header count |
|---|---|---|---|
| `/` | 0 | `200 OK` | 1 |
| `/nope` | 0 | `404 Not Found` | 1 |
| `/_next/static/chunks/0cz1d0mv5g_q7.js` | 0 | `200 OK` | 1 |

All three returned the same global CSP without comma-combined policies. Wrangler was stopped with Ctrl+C (session exit 1 from interruption). Browser CSP-console/UI/motion checks, E2E/accessibility, production TLS/headers and operational controls remain unverified in this revision.
