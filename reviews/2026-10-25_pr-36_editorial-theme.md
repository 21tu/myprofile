# コードレビュー記録 — Editorial Minimalism と OS に合わせたライト / ダーク

- レビューID: REV-20261025-008
- 日時（タイムゾーン）: 2026-10-25（JST）
- レビュアー: Claude Code
- 実装担当: Codex。設計（`docs/ui-design.md` §9、ADR-008）は Claude Code
- PR/Issue URL: https://github.com/21tu/myprofile/pull/36 / #35
- 対象ブランチ / コミットSHA: `feat/35-editorial-theme` / 初回 `736da57`、修正が最新
- 対応仕様ID: UX-001（ADR-008 で改訂）, FR-002, FR-011, NFR-001, NFR-003, NFR-004
- 判定: `APPROVE`（Claude Code の判定。GitHub 上は COMMENT）

## 2. 検証エビデンス
| 検査 | 結果 | 証跡 |
|---|---|---|
| quality（Vitest 64 passed / 1 skipped ほか） | PASS | CI run 40119954180 |
| e2e（ライトテーマの axe と横スクロール、Hero の見出しの比率を追加） | PASS（22 / 22） | 同上 |
| lighthouse（モバイル、3 回） | Perf 0.90 / 0.98 / 0.98、A11y 1.00、BP 0.96（仮画像の低解像度）、SEO 1.00、CLS 0、LCP 2.44〜2.55s | artifact の lhr |
| 実ブラウザ（Claude Code） | ダーク / ライトとも、コンソール 0 件。背景色はトークンどおり。1440px で横スクロールなし。375px のファーストビューに CTA（下端 424 / 667px） | ローカル（新しいサーバー） |
| コントラスト比 | 全組み合わせで 4.5:1 以上（計算値）。ライトの axe は 0 件（E2E） | ADR-008 |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | UX-001, NFR-008 | `src/app/globals.css:62` | 要素へのスタイルがレイヤーに属さず、Tailwind のユーティリティより優先される。`#hero h2` のサイズの指定が効かず、72px になる | 見出しの階層が崩れ、見出しへのユーティリティが効かない | `@layer base` に移す。E2E で「Hero の h2 < h1 × 0.5」を確認する | RESOLVED |
| F-002 | MINOR | UX-001 | `src/components/sections/Projects.tsx:26` | 1 件目を大きく表示したあと、残りが奇数件だと最後のカードが半分の幅で、右が空く | 見た目のバランス | 単独の最後の 1 件は `md:col-span-2` にする | RESOLVED |

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-25 | 修正のコミット | F-001, F-002 | CI の 4 ジョブが pass、e2e 22 / 22（両テーマでの見出しの比率を含む） | APPROVE |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 残る課題: BP 0.96 と LCP 約 2.5s は、仮のマスコット画像が原因。次の Issue（SVG のきつね）で解消を図る
- 教訓: Tailwind v4 で、要素へのスタイルを `@layer base` の外に書くと、ユーティリティに勝ってしまう（`pitfalls.md` に追記する）
