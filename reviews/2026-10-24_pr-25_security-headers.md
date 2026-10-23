# コードレビュー記録 — CSP とセキュリティヘッダー

- レビューID: REV-20261024-005
- 日時（タイムゾーン）: 2026-10-24（JST）
- レビュアー: Claude Code（Security Team / Code Review Team）
- 実装担当: Codex
- PR/Issue URL: https://github.com/21tu/myprofile/pull/25 / #9
- 対象ブランチ / コミットSHA: `feat/9-security-headers` / 初回 `22ded4d`、修正 `91ba519`
- 対応仕様ID: SEC-001〜SEC-004, SEC-007, NFR-007
- 参照ADR: ADR-004, ADR-005
- 判定: `APPROVE`（Claude Code の判定。GitHub 上は COMMENT）

## 2. 検証エビデンス
| 検査 | コマンド / 手順 | 結果 | 実行環境・証跡 |
|---|---|---|---|
| Format / Lint / Typecheck / Unit / Build | npm scripts | PASS（Vitest 37 passed / 1 skipped） | Codex + CI run 39993356994 |
| `_headers` の生成 | `npm run build` → postbuild | PASS（CSP は `/*` の 1 つだけ。style 属性 14 件・値 10 種類をハッシュで許可） | ローカル（Claude Code） |
| ヘッダーの配信 | `wrangler dev --local` → `curl -sI` | PASS: `/` 200、`/nope` 404、`/icon.svg` 200。どれも CSP がちょうど 1 つ。HSTS、nosniff、Referrer-Policy、Permissions-Policy、COOP、X-Frame-Options を確認 | ローカル（Claude Code） |
| 実ブラウザでの CSP 違反 | Playwright Chromium で wrangler の配信を開き、全体をスクロール → コンソールを確認 | PASS: `/` は error / warning 0 件。`/nope` は 404 のリソースエラー 1 件だけ（想定どおり）で、CSP 違反はなし | 同上 |
| CSP の下でのモーション | Kinetic の animationDelay、ハイドレーション、Reveal | PASS（`0s,0.06s,…0.3s`、ハイドレーション済み、スクロール後に隠れたままの要素 0） | 同上 |
| 本番の TLS とヘッダー | — | 未検証（デプロイの承認後） | — |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | SEC-002, FR-008 | `scripts/lib/csp.mjs:54` | `style-src 'self'` で style 属性 14 件がブロックされる | Kinetic の遅延が効かず、コンソールに CSP 違反が出る | `style-src-attr 'unsafe-hashes'` と値ごとのハッシュで許可する（`unsafe-inline` は使わない） | RESOLVED（`91ba519`。実ブラウザで違反 0 件） |
| F-002 | MAJOR | SEC-002 | `scripts/lib/csp.mjs:65` | 存在しないパスの 404 応答に CSP が付かない | HTML の応答に CSP のない経路が残る | `/*` に、全ページのハッシュを合わせた CSP を 1 つだけ出す | RESOLVED（`91ba519`。`/nope` に CSP が 1 つ付く） |

GitHub 上のレビュー: https://github.com/21tu/myprofile/pull/25#pullrequestreview-5631811287

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-24 | `91ba519` | F-001, F-002 | 上の表のとおり | APPROVE（Claude Code の判定） |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- リスク受容: `'unsafe-hashes'` を使うが、許可するのはビルドの成果物にある値だけで、ユーザーが入力したものは表示しないため、影響は限定的と判断した（ADR-005）。HSTS は includeSubDomains / preload なしで開始する
- 未検証事項: 本番のヘッダーと TLS、Safari と Firefox での CSP Level 3（`style-src-attr` / `unsafe-hashes`）の挙動
- 本番デプロイ承認: 対象外
