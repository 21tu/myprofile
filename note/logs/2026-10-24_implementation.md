# note development log — Webサイトの実装（第2回の素材）

- Date: 2026-10-24（JST）
- GitHub Issue / PR:
  - #6, #13 → PR #22（土台）
  - #17〜#21 → PR #23（画面）
  - #8 → PR #24（モーション）
  - #9 → PR #25（セキュリティ）
  - #15, #10 → PR #26（CI / E2E）
  - #11（本ドキュメントの更新）
- Goal and design context: Claude Code が設計・レビュー、Codex が実装、Codex の別のセッションが Testing Team を担当する。
- Architecture decision and alternatives:
  - ADR-004（構成と、仮データを型で管理する方法）
  - ADR-005（CSP をビルド後のハッシュで作る方式、HSTS は includeSubDomains なし）
  - `docs/ui-design.md` の変更履歴（モバイルメニューを button に変えた）

## What Codex implemented (only verified facts)
| 区分 | 内容 | 根拠 |
|---|---|---|
| 実装済み | Next.js 16 の静的エクスポート、Tailwind 4、Vitest、Wrangler の設定 | PR #22、`a8c329a` |
| 実装済み | デザインシステム、9 つのセクション、vCard の生成（確定データのときだけ） | PR #23、`fe41e3e` |
| 実装済み | Kinetic / Reveal / Bento / Scrollytelling / Parallax | PR #24、`8f5b240`、`aff1bba` |
| 実装済み | CSP（スクリプトと style 属性のハッシュ）とセキュリティヘッダー | PR #25、`22ded4d`、`91ba519` |
| 実装済み | E2E、axe、Lighthouse CI、gitleaks、ジョブ 4 つ | PR #26、`c518304`、`466853c` |
| 検証済み | E2E 18 passed、axe の serious / critical 0 件 | CI run 40038369430 |
| 検証済み | Lighthouse（モバイル、ラボ）: Perf 0.90〜0.98、A11y / BP / SEO 1.00、LCP 2.27〜2.43s、CLS 0 | CI run 40036250539 の artifact |
| 検証済み | wrangler で、`/`・`/nope`・アセットそれぞれに CSP がちょうど 1 つ。Chromium で CSP 違反 0 件 | REV-005 |
| 予定 | 本番デプロイ、独自ドメイン、公開情報の確定、マスコットの正式画像 | — |

## Claude review: findings and fixes
| レビュー | MAJOR | 内容 | 解決 |
|---|---|---|---|
| REV-002 | 1 | CRLF と Prettier の不一致（Windows） | `.gitattributes` で LF に統一 |
| REV-003 | 1 | `span` に付けた `aria-label` は ARIA で禁止 | `sr-only` のテキストにする |
| REV-004 | 2 | Reveal が実ブラウザで動かない / テストのモックで見逃していた | 状態で管理する実装に変更。E2E で補完 |
| REV-005 | 2 | style 属性 14 件がブロックされる / 404 に CSP がない | `style-src-attr` のハッシュ、全体で CSP を 1 つにする |
| REV-006 | 1 | `<summary>` が button として認識されない（Testing Team が発見） | 1 回目の修正は効かず、`<button>` に作り替えた |

## Commands run and results
上の表と `reviews/` の各記録を参照。

## Images/screenshots approved for publication（公開可否はオーナーが判断）
- `note/images/impl-ui-mobile-375.png`: 実装済みの画面のスクリーンショット（ローカルのビルドを Playwright Chromium で撮影。仮データ）
- `note/images/impl-ui-desktop-1440-full.png`: 同上（Services を 2×2 にする前の画面）

## Security-sensitive information removed
トークン、メールアドレス、ローカルの絶対パス、CSP のハッシュの全文は記事に載せない。

## 発生した問題（プロセス）
- Codex が npm のキャッシュを `_setup/` やリポジトリの直下に作った → 以後の依頼で禁止した
- Claude Code が `.playwright-mcp/` を誤ってコミットした → 管理対象から外した
- Claude Code が Issue #13 の本文を空で上書きした → 復元した
- メモリ不足で、バックグラウンドの処理が自動的に止められた → Codex 自体は処理を続けて完了していた。以後は、重い検査をローカルでは動かさず CI に任せた

## Lessons and next article outline
- アニメーションのライブラリの不具合は jsdom では再現できない。実ブラウザでの E2E を必須にする
- テストチームを独立させると、実装チームの思い込みを外から壊せる
- 第3回の予定: Claude Code と Codex の役割分担、レビューの書式、独立したテストチームの運用
