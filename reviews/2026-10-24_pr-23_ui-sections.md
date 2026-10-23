# コードレビュー記録 — デザインシステムと全セクション

- レビューID: REV-20261024-003
- 日時（タイムゾーン）: 2026-10-24（JST）
- レビュアー: Claude Code
- 実装担当: Codex（設計書 `docs/ui-design.md` は Claude Code）
- PR/Issue URL: https://github.com/21tu/myprofile/pull/23 / #17, #18, #19, #20, #21
- 対象ブランチ / コミットSHA: `feat/17-ui-sections` / 初回 `fe41e3e`（+ `32de0a7`）、修正 `b1ee8b6`
- 対応仕様ID: FR-001〜FR-006, FR-011, NFR-001〜NFR-003, UX-001, UX-002
- 参照ADR: ADR-004、UI-DESIGN-001
- 判定: `APPROVE`（Claude Code の判定。GitHub 上は同じアカウントのため COMMENT で投稿）

## 1. 変更差分
| ファイル | 変更内容 | 理由 | 仕様ID |
|---|---|---|---|
| `src/app/globals.css` | `@theme` のトークン、フォーカス、CSS のマイクロインタラクション | デザインシステム | UX-001, NFR-002 |
| `src/components/ui/*` | 共通部品 7 つ | #17 | UX-001 |
| `src/components/sections/*` | 9 つのセクション | #18〜#21 | FR-001〜FR-006, FR-011 |
| `src/config/*` | コンテンツモデルの拡張、Skills 8 項目は confirmed | ADR-004 | FR-005 |
| `src/lib/vcard.ts`, `scripts/generate-vcard.mjs` | vCard の生成（確定データのときだけ） | #21 | FR-006 |
| `src/app/icon.svg` | 文字ベースの favicon | F-002 | NFR-001 |

## 2. 検証エビデンス
| 検査 | コマンド / 手順 | 結果 | 実行環境・証跡 |
|---|---|---|---|
| Format / Lint / Typecheck / Unit | `npm run format:check` / `lint` / `typecheck` / `test` | PASS（Vitest 17 passed / 1 skipped） | ローカル（Claude Code が再実行）+ CI run 39988946253 |
| Build | `npm run build` | PASS（`out/icon.svg` あり。仮データのため `contact.vcf` はなし） | ローカル + CI |
| レスポンシブ | Playwright で 320 / 375 / 768 / 1440px の横はみ出し要素を計測 | PASS（0 件） | ローカル Chromium |
| ファーストビュー | 375×667 で h1 と CTA の位置を計測 | PASS（CTA の下端 389px） | `note/images/impl-ui-mobile-375.png` |
| デスクトップの表示 | 1440px の全画面スクリーンショット | 目視で確認 | `note/images/impl-ui-desktop-1440-full.png` |
| axe / キーボード E2E | — | 未検証（#10, #15） | — |
| 実機 / スクリーンリーダー | — | 未検証 | — |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | NFR-001 | `src/components/ui/SampleBadge.tsx:4` | generic な `span` に `aria-label` を付けている（ARIA で禁止） | 読み上げられないことがあり、axe の `aria-prohibited-attr` にも該当する | `sr-only` のテキストにする | RESOLVED（`b1ee8b6`） |
| F-002 | MINOR | NFR-001 | `src/app/layout.tsx:11` | favicon がなく 404 になる（コンソールにエラー） | コンソールのエラー、Best Practices | `icon.svg` を置く | RESOLVED（`b1ee8b6`） |
| F-003 | MINOR | NFR-006 | `src/lib/vcard.ts:1` | UTF-8 の BOM が入っている | 一貫性 | BOM を取り除く | RESOLVED（`b1ee8b6`） |
| F-004 | MINOR | UX-001 | `src/components/sections/Services.tsx:14` | md 以上の Bento Grid で、2 行目の右側に空きのセルができる（1440px のスクリーンショットで確認） | 見た目のバランス | Animated Bento Grid の実装時に、カードの幅の割り当てを見直す | DEFERRED → #8 |

GitHub 上のレビュー: https://github.com/21tu/myprofile/pull/23#pullrequestreview-5631504392

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-24 | `b1ee8b6` | F-001〜F-003 | 差分を確認。全ゲートを Claude Code が再実行して PASS。BOM は 0 件、`out/icon.svg` あり。CI pass | APPROVE（Claude Code の判定） |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 未検証事項: axe、キーボード E2E、実機、スクリーンリーダー（#10, #15）
- 観察（プロセス）: Codex がリポジトリ直下に `.npm-cache/` を作っていた（削除済み。以後の依頼で禁止した）。`.playwright-mcp/` が Claude Code のミスで `fe41e3e` に入ったため、`32de0a7` で管理対象から外し、`.gitignore` に追加した
- 本番デプロイ承認: 対象外（仮データのため `check:content` が失敗する状態）
