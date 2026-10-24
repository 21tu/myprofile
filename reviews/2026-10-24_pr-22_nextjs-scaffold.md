# コードレビュー記録 — Next.js の土台（静的エクスポート + Cloudflare）

- レビューID: REV-20261024-002
- 日時（タイムゾーン）: 2026-10-24（JST）
- レビュアー: Claude Code
- 実装担当: Codex（ADR-004 のみ Claude Code）
- PR/Issue URL: https://github.com/21tu/myprofile/pull/22 / #6, #13
- 対象ブランチ / コミットSHA: `feat/6-nextjs-scaffold` / 初回 `a8c329a`、修正 `6178b28`
- 対応仕様ID: FR-010, NFR-005, NFR-006, QA-001, FR-005
- 参照ADR: ADR-001, ADR-004
- 判定: `APPROVE`（Claude Code の判定。BLOCKER/MAJOR は解消済み。GitHub 上は同じアカウントのため COMMENT で投稿）

## 1. 変更差分
| ファイル | 変更内容 | 理由 | 仕様ID |
|---|---|---|---|
| `package.json`, `package-lock.json` | Next 16.4.3 / React 19.3.1 / TS 6.0.3 / Tailwind 4.3.3 / Motion 14.6.0 / Vitest 5 / Wrangler 4 | 土台づくり | FR-010 |
| `next.config.ts` | `output: 'export'` ほか | 静的配信 | FR-010 |
| `wrangler.jsonc` | assets-only、404-page | Workers Static Assets | FR-010 |
| `src/config/*`, `src/lib/content-check.ts` | 型付きのコンテンツと仮データの検出 | ADR-004 | FR-005 |
| `tests/unit/*` | 単体テスト | 検証 | QA-001 |
| `.gitattributes` | LF に統一 | F-001 | NFR-006 |

## 2. 検証エビデンス
| 検査 | コマンド / 手順 | 結果 | 実行環境・証跡 |
|---|---|---|---|
| Format | `npm run format:check` | PASS | ローカル（Windows, Node 22.14.0）+ CI |
| Lint | `npm run lint` | PASS（警告0） | ローカル + CI |
| Typecheck | `npm run typecheck` | PASS（`next-env.d.ts` を消した状態でも） | ローカル + CI |
| Unit | `npm test` | PASS（4 passed / 1 skipped） | ローカル + CI |
| Build / static export | `npm run build` | PASS（`out/index.html`, `out/404.html`） | ローカル + CI |
| コンテンツチェック | `npm run check:content` | 想定どおり FAIL（仮データ5件） | ローカル |
| Cloudflare preview | `wrangler dev --local` | PASS（`/` 200、`/nope` 404） | ローカル |
| Dependency | `npm audit --omit=dev --audit-level=high` | PASS（0件） | CI run 39985994530 |
| E2E / a11y / Lighthouse | — | 未検証（#10, #15） | — |
| Security headers | — | 未検証（#9） | — |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | NFR-006, QA-001 | `.prettierrc.json:1`（`.gitattributes` がない） | autocrlf のため、取り出したファイルが CRLF になり、`prettier --check` が exit 1 | Windows の開発環境で format:check が失敗する | `.gitattributes` で LF に統一し、renormalize する | RESOLVED（`6178b28`、再現手順で exit 0） |
| F-002 | MINOR | UX-001 | `src/app/globals.css:5` | 色とフォントを直接書いている | トークンの一元管理ができない | `@theme` のトークンにする | DEFERRED → #17 |
| F-003 | MINOR | QA-001 | `tests/unit/content-check.test.ts:6` | 公開前チェックが `npm_lifecycle_event` に依存していることが暗黙的 | `npx vitest` で直接実行すると、何も表示されずにスキップされる | 意図をコメントで明記する | RESOLVED（`6178b28`） |

GitHub 上のレビュー: https://github.com/21tu/myprofile/pull/22#pullrequestreview-5631267536

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-24 | `6178b28` | F-001, F-003 | F-001 の再現手順で exit 0。format:check と test が PASS。CI run 39986471446 が pass | APPROVE（Claude Code の判定） |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 例外・リスク受容（承認者と理由）: なし
- 未検証事項: E2E、a11y、性能、セキュリティヘッダー（後続の Issue）。CI の actions が Node 20 の非推奨警告を出している（#15）
- 観察（プロセス）: Codex が初回の作業で、npm のキャッシュと検証ログを `_setup/` に書き込んでいた（Git には入っていない）。以後の依頼では `_setup/` への書き込みを禁止した
- 本番デプロイ承認: 対象外
