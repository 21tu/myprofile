# UX監査記録 — サイト全体のUX監査（ui-ux-pro-max + Codex product-design:audit）

- レビューID: REV-20261029-001
- 日時（タイムゾーン）: 2026-10-29（JST）
- レビュアー: Claude Code（判定）。独立監査: Codex `product-design` プラグイン 0.1.56 の `audit` スキル
- 実装担当: —（監査のみ。コードは変更していない）
- PR/Issue URL: https://github.com/21tu/myprofile/issues/39
- 対象ブランチ / コミットSHA: `feat/37-fox-character` / `2e643bd`（PR #34 → #36 → #38 の積み上げの先頭）
- 対応仕様ID: NFR-001, NFR-002, NFR-003, FR-002, FR-003, UX-001
- 変更概要・背景: オーナーの依頼で、ui-ux-pro-max のUXガイドラインを観点に加えて、サイト全体のUXを監査した。Codex にも同じ範囲を独立して監査させ、結果を Claude Code が検証してから採用した。
- 参照ADR: ADR-009（きつねの SVG キャラクター）。設計: `docs/ui-design.md` §4, §9
- 判定: `COMMENT`（監査。BLOCKER / MAJOR は 0 件。MINOR 9 件を改善 Issue へ）

## 1. 監査の範囲
| 対象 | 状態 | 方法 |
|---|---|---|
| トップページ（全セクション） | 幅 320 / 375 / 768 / 1440px × ライト / ダーク | 1画面目とページ全体のスクリーンショット |
| prefers-reduced-motion | 375px | スクリーンショット |
| キーボード | 375px | Tab 順の記録、フォーカスの見え方、メニューから移動したあとの `activeElement` |
| モバイルメニュー | 375 / 320px | 開く、項目を選ぶ、外側をタップ、スクロール |

## 2. 検証エビデンス
| 検査 | コマンド / 手順 | 結果 PASS/FAIL/未検証 | 実行環境・証跡 |
|---|---|---|---|
| Build / static export | `npm run build` | PASS | ローカル Windows 11、Node 22.14.0、`2e643bd` |
| E2E / viewport | Playwright（Chrome 安定版を `channel: 'chrome'` で使用）で、横スクロール量と、44px 未満のタップ対象を測定 | PASS（全8条件で横スクロール 0、44px 未満 0） | スクラッチのスクリプト。リポジトリのテストではない |
| axe + 手動a11y | `@axe-core/playwright` 4.14.0、タグ wcag2a/2aa/21aa/22aa | axe は PASS（全8条件で違反 0）。手動はキーボードのみ実施（A-003 を参照） | 同上 |
| UXガイドライン | ui-ux-pro-max 2.15.0 の `search.py --domain ux / landing` | 参照のみ。採用した項目は各指摘に記載 | — |
| Codex 独立監査 | `codex exec -s workspace-write`（product-design:audit）。1回目はブラウザ操作が承認ポリシーで拒否されて中止。2回目は Claude Code のスクリーンショット20枚を証跡として渡して実施 | 指摘 MINOR 3件 + リスク 1件。Claude Code が全件を再確認した | codex-cli 0.164.0 |
| Format / Lint / Typecheck / Unit | — | 未検証（コード変更なし。前回 REV-20261025-009 の結果から変化なし） | — |
| Security / dependency / secret | — | 対象外 | — |
| Lighthouse / 実機 | — | **未検証**（今回は再測定していない。iOS Safari / Android Chrome / QR 読み取りアプリ内のブラウザも未確認） | — |

## 3. 指摘事項
ui-ux-pro-max の参照: 「Heading Line Balance」（Typography）、「Touch Spacing」（Touch）、「Text Reflow and Spacing」（Accessibility）、ランディングのパターン「Portfolio Grid」（Hero → 実績 → 連絡）。

| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 出典 | 状態 |
|---|---|---|---|---|---|---|---|---|
| A-001 | MINOR | NFR-003 | `src/components/sections/Header.tsx:28`, `src/components/ui/ButtonLink.tsx:24` | 320px で、ヘッダーの「問い合わせ」が「問い合わ / せ」の2行に折り返され、サイト名も2行になる（ライト / ダーク両方） | 常に見えている連絡の導線が読みにくい。ヘッダーが高くなり、1画面目の情報が下に押される | ヘッダーの CTA に `whitespace-nowrap shrink-0`。サイト名は `truncate` などで幅を譲る。320px で再撮影 | Claude Code / Codex F-01 | OPEN → #40 |
| A-002 | MINOR | NFR-002 | `src/components/sections/MobileMenu.tsx:11-24` | メニューを開いたまま、外側をタップしても、スクロールしても閉じない（Playwright で確認） | パネルが本文に重なったまま残る。閉じる手段がボタンと Escape しかない | 外側の `pointerdown` と、スクロール（または `hashchange`）で閉じる | Claude Code | OPEN → #40 |
| A-003 | MINOR | NFR-002 | `src/components/sections/MobileMenu.tsx:49` | キーボードでメニューを開き、Contact で Enter を押すと、選んだリンクがアンマウントされ、`activeElement` が `BODY` になる。Chrome では次の Tab が移動先の続き（フッター）に進むので、操作は止まらない。`ui-design.md` §4 の「閉じたらフォーカスをボタンに戻す」とも違う | スクリーンリーダーで読み上げの位置を見失うおそれがある（未検証） | 移動先のセクション見出しに `tabIndex={-1}` を付けて `focus({ preventScroll: true })` する。合わせて `ui-design.md` §4 を「リンクで閉じたときは移動先へ、Escape のときはボタンへ」と改める | Codex R-01（MAJOR のリスクとして報告）→ Claude Code が再現して MINOR と判定 | OPEN → #40 |
| A-004 | MINOR | NFR-003 | `src/app/globals.css:57-67` | 大きな見出しが語の途中で改行される（例「氏名（準備 / 中）」。320px と 1440px） | 名前やキャッチコピーが読みにくい。実際の氏名で再発するかは未確定 | `h1, h2` に `word-break: auto-phrase`（対応ブラウザのみ）と `text-wrap: balance`。対応していないブラウザでは今の折り返しのまま | Claude Code（ui-ux-pro-max「Heading Line Balance」） | OPEN → #40 |
| A-005 | MINOR | FR-002 | `src/components/ui/Section.tsx:23`, `src/components/sections/Hero.tsx:70`, `src/components/character/InteractiveCharacter.tsx:185` | モバイルでセクションの上下の余白が 96px ずつあり、375px でページの高さが 6166px。1画面目に Services の入口が見えず、「スクロール」の案内はきつねの下（およそ2画面目）にある | QR から開いた人が、提供内容にたどり着くまでのスクロールが長い | モバイルだけ余白を `py-16` 程度に減らす。きつねの表示サイズをモバイルで小さくする（**形・色は変えない**。サイズの変更もオーナーの判断とする） | Claude Code / Codex F-03 | OPEN → #40（2026-10-29 オーナー決定: モバイルではきつねを小さくし、登場の動きで目立たせる。形・色は変えない。`ui-design.md` §10.7）。セクションの余白は今回は変えない |
| A-006 | MINOR | FR-002 | `src/config/navigation.ts:1-8` | ナビが英語だけ（Services / About …）。CTA は日本語の「問い合わせ」なので、同じ行き先が「問い合わせ」と「Contact」の2つの名前で出てくる | 日本語で読む人が、英語のラベルを頭の中で置き換える必要がある | 日本語のラベルにする、または英語に日本語を添える | Codex F-02 | 保留（2026-10-29 のオーナー回答で選ばれず。今の英語ラベルのまま） |
| A-007 | MINOR | FR-002 | `src/components/sections/Services.tsx:28` | セクション番号「01」と、Services の各行の「01〜04」と、Process の「1〜5」の3種類の番号が近くに並ぶ | どの番号が何を指すのか、少し迷う | Services の各行の番号をなくす（アイコンが残る） | Claude Code | 保留（2026-10-29 のオーナー回答で選ばれず。今のまま） |
| A-008 | MINOR | FR-002, FR-003 | `src/components/sections/Header.tsx:28`, `src/components/sections/Hero.tsx` の CTA | モバイルの1画面目で、ヘッダーの「問い合わせ」（塗りつぶし）と Hero の「制作実績を見る」（塗りつぶし）が並び、主なボタンが2つに見える。「問い合わせ」も2回出てくる | どちらを押せばよいかが一目でわかりにくい | ヘッダーの CTA を枠線のスタイル（secondary）にする | Claude Code | OPEN → #40 |
| A-009 | MINOR | FR-005 | `src/config/content.ts:100-101` | Skills で、カテゴリ「AI」の中身が「AI」だけになっている | 情報が重なっていて、内容がない | 公開情報を確定するときに見直す（仮データ） | Claude Code | OPEN → 公開情報の確定時（#29 系のオーナー作業） |

採用しなかったもの:
- ページ全体のスクリーンショットで、ヘッダーと「本文へスキップ」が Hero の途中に写っている → 撮影時のスクロール位置による写り込み。ふだんの状態ではスキップリンクが画面外にあること（`bottom: -37px`）を確認した。

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| | | | | |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 例外・リスク受容（承認者と理由）: なし
- 未検証事項: 実機（iOS Safari / Android Chrome / QR アプリ内ブラウザ）、スクリーンリーダー、200% / 400% のズーム、強制カラー、Lighthouse の再測定、INP、アニメーションの動き方（静止画では確認できない）
- 次のアクション: A-001〜A-004 と A-008 を #40 にまとめた。2026-10-29 にオーナーが Codex への依頼を了承した。A-005 はオーナーの決定により #40 に追加した。A-006 / A-007 は保留。A-009 は公開情報の確定時に扱う
- 本番デプロイ承認: 未取得

> 記録には秘密情報・個人情報・本番トークンを記載しない。検証していない事項をPASSにしない。
