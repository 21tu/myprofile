# UI・モーション設計書

- 文書ID: UI-DESIGN-001
- 作成: UI/UX Team（Claude Code）／ 実装: Development Team（Codex）
- 対象 Issue: #7（親）、#17〜#21、#8
- 対応仕様: FR-001〜FR-006, FR-008, FR-009, FR-011, NFR-001〜NFR-004, UX-001, UX-002
- テーマ: **ダークネイビー × モダン × ビジネス × 親しみやすさ**

## 1. 原則
- **モバイル優先。** 名刺の QR コードからスマートフォンで開く人を最優先にする。320px から崩れず、横スクロールが出ないこと。
- **JS がなくても読める。** 静的 HTML の時点で、すべてのコンテンツが見える状態にする。アニメーションは見た目を足すだけにし、表示の条件にしない。
- **`prefers-reduced-motion: reduce` のとき**は、装飾的な動きをすべて止める。フォーカスリングと色の変化は残す。
- **Server Component が基本。** 動きや開閉など、どうしても必要な部分だけを Client Component にする。
- 動かすのは `transform` と `opacity` だけ。CLS を出さない。
- 実在しない経歴・実績・顧客・数値を作らない。未確定の情報は `src/config/content.ts` の `status: 'placeholder'` で管理し、画面に「サンプル」と表示する（ADR-004）。

## 2. デザイントークン（`src/app/globals.css` の `@theme`）
| トークン | 値 | 用途 |
|---|---|---|
| `--color-navy-950` | #0B1626 | ページの背景（Background） |
| `--color-navy-900` | #111F33 | セクション（Section） |
| `--color-navy-800` | #192A40 | カード（Card） |
| `--color-accent` | #58B8FF | アクセント、リンク、フォーカス |
| `--color-ink` | #F5F7FA | 本文（Text） |
| `--color-ink-muted` | #A8B5C5 | 補助テキスト（Sub Text） |

- フォント: システムフォントのスタック（`system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif`）。外部の Web フォントは読み込まない（性能と CSP のため）。
- 本文 16px 以上、行間 1.7。見出しは `clamp()` で流動的に変える。
- 角丸はカード 16px（`rounded-2xl`）、ボタンは pill 型。カードの境界は `1px solid rgb(88 184 255 / .15)`。
- フォーカスは `:focus-visible` に `outline: 2px solid var(--color-accent); outline-offset: 3px` を全要素に適用する。
- タップできる領域は 44×44px 以上。
- コントラスト: `ink` / `ink-muted` と navy の組み合わせは、いずれも 4.5:1 以上（AA）。アクセント色の文字は、navy の背景の上でだけ使う。

## 3. 共通コンポーネント（#17、`src/components/ui/`）
| 名前 | 役割 |
|---|---|
| `Container` | 最大幅 72rem、左右の余白（`px-4 sm:px-6`） |
| `Section` | `<section id aria-labelledby>`、見出し（h2）、リード文。`scroll-mt` でヘッダーの高さを考慮する |
| `Card` | navy-800 の背景、境界線、角丸。ホバー・フォーカスで少し持ち上げる（#8） |
| `ButtonLink` | `variant: 'primary' \| 'secondary'`。外部リンクには `target="_blank" rel="noopener noreferrer"` を付け、「新しいタブで開く」ことを伝える |
| `Tag` | 技術名などのチップ |
| `SampleBadge` | 「サンプル」バッジ（`aria-label="サンプルデータ"`） |
| `MascotSlot` | マスコットの正式画像の枠（破線の枠に「マスコット画像（正式画像の提供待ち）」と表示）。**無関係な画像やイラストで代用しない** |

アイコンは **Lucide React** を使う。装飾用は `aria-hidden="true"`、意味を持つ場合は隣にテキストを置く。

## 4. 画面構成（`src/app/page.tsx`）
1. **Skip link**: 「本文へスキップ」→ `#main`
2. **Header**（#18）
   - sticky、`navy-950/80` の背景と backdrop blur
   - 左にロゴ（サイト名。`content.site.name`）、右にナビ（Services / About / Skills / Projects / Process / Contact）と「問い合わせ」ボタン
   - `md` 未満では、ナビを **`MobileMenu`（Client Component）** にする。`<button type="button" aria-expanded aria-controls>`（アクセシブルネーム「ナビゲーションメニュー」）で開閉し、Escape キーとリンクのクリックで閉じ、閉じたらフォーカスをボタンに戻す。問い合わせボタンは常に表示する。
     - 変更履歴（REV-20261024-006 F-001）: 当初は `<details>`/`<summary>` で JS なしの開閉にしていた。しかし `<summary>` は Playwright を含む多くの支援技術の役割の計算で button として扱われず、E2E で操作できなかったため変更した。JS がない環境では、Footer のナビゲーション（全セクションへのリンク）を代わりの手段とする。
3. **Hero**（#18）
   - **ファーストビュー（375×667）に収めるもの:** 氏名（h1）、肩書き、対応業務（タグを3〜4個）、キャッチコピー、「制作実績を見る」（→ `#projects`）、「問い合わせ」（→ `#contact`）
   - 自己紹介の短い文
   - マスコットの枠（`MascotSlot`）。モバイルでは CTA の下に置く
4. **Services**（#19）: Web開発 / AI・画像処理 / Cloud / 自動化 の4枚を Bento Grid で並べる。`md` 以上では、1枚目を2列分の幅にする。Lucide のアイコンを付ける
5. **About**（#19）: 経歴、人物紹介、趣味（すべて仮データ）
6. **Skills**（#19）: Python、React、Next.js、TypeScript、C++、AWS、Docker、AI。**オーナーの指示書で指定された一覧なので `confirmed`**。カテゴリ（Language / Frontend / Cloud・Infra / AI）ごとにグループにした Bento Grid。習熟度のバーや数値は出さない
7. **Projects**（#20）
   - カードに、名称、概要、技術タグ、詳細リンクを載せる。リンクは `href` がある（実在する URL がある）ときだけ出す
   - 実績はすべて仮データ。架空の顧客名や成果の数値を作らない
8. **Work Process**（#20）: ヒアリング → 設計 → 実装 → レビュー → 公開・改善 の5ステップを `ol` で並べる。縦のタイムライン（左に線と番号）にする
9. **Contact**（#21）
   - メール、GitHub、vCard
   - 確定した値があるときだけリンクにする。仮データの間は「連絡先は準備中です」と表示し、`mailto:` も vCard も出力しない
   - vCard は、確定した連絡先からビルド時に `public/contact.vcf` を生成する（`scripts/` の生成スクリプト、または Route Handler の静的エクスポート）。RFC 6350 の必須項目（BEGIN / VERSION:4.0 / FN / END）を満たし、値をエスケープする
10. **Footer**（#21）: セクションへのリンク、GitHub（確定時のみ）、コピーライト（`© {年} {氏名}`）、「トップへ戻る」

## 5. コンテンツモデル（`src/config/types.ts` を拡張）
- `site`: `{ name }`
- `profile`: `{ status, name, title, catchphrase, intro, focusAreas: string[] }`
- `about`: `{ status, career, personality, hobbies }`
- `services[]`: `{ status, id, name, description, icon }`（`icon` は Lucide のアイコン名を union 型で絞る）
- `skills[]`: `{ status, name, category }`
- `projects[]`: `{ status, name, summary, technologies, href: string | null }`
- `process[]`: `{ title, description }`（説明の文章であり、事実の主張ではないので status は持たない）
- `contact`: `{ email: ContactValue, github: ContactValue }`。`ContactValue` は discriminated union で、`placeholder` のときは `value: null` にする
- 仮データの文面は「〜（準備中）」「サンプルプロジェクト A」のように、仮であることがわかる書き方にする

## 6. モーション（#8）
| 名称 | 対象 | 動き | 実装 | reduced-motion |
|---|---|---|---|---|
| Kinetic Typography | Hero のキャッチコピー | 単語ごとに順番にフェードアップ（60ms ずつずらす） | CSS keyframes（JS 不要） | 動かさない |
| Animated Bento Grid | Services / Skills | 画面内に入ったら、カードが少しずつずれて登場する。ホバーでアイコンが少し動く | Motion（`Reveal` + stagger） | 最初から表示 |
| Scrollytelling | Work Process | スクロールに合わせて、タイムラインの線が伸び、通過したステップの番号がアクセント色になる | Motion の `useScroll` + `useTransform` | 線を最初から全部表示 |
| Scroll Reveal | 各セクションの見出しとカード | 画面内に入ったら 16px 下からフェードアップ（一度だけ） | `Reveal`（Client Component） | 最初から表示 |
| Micro-interactions | ボタン・カード・リンク | ホバー・フォーカスで持ち上げる・光る。押したときに scale .98 | CSS transition 150ms | 色の変化だけ残す |
| 控えめなパララックス | Hero の背景のグラデーションとマスコットの枠 | スクロール量に対して ±24px 以内でゆっくり動く | Motion の `useScroll` | 動かさない |

**`Reveal` の仕様（コンテンツを非表示のままにしないため）**
- サーバーが出力する HTML では、常に表示された状態にする。
- 読み込み後の時点で画面外にある要素だけを、いったん非表示の状態にし、画面内に入ったら一度だけ表示のアニメーションを再生する。
- 読み込みの時点ですでに画面内にある要素は、動かさない（チラつきを防ぐため）。
- `useReducedMotion()` が true のときは何もしない。
- スクロールを奪う演出、長いイントロ、強制スクロール、WebGL は使わない。

## 7. テスト
- Vitest + React Testing Library（Development Team）
  - h1 が1つで、各セクションに h2 があること
  - Hero の CTA のリンク先
  - Skills の8項目
  - 「サンプル」バッジ
  - `href: null` の Project にリンクが出ないこと
  - 仮データの連絡先に `mailto:` が出ないこと
  - vCard の生成（エスケープ、仮データのときは null）
- Playwright + axe（Testing Team、#10・#15）
  - 320 / 375 / 768 / 1440px で横スクロールがないこと
  - 375px で、Hero の氏名・肩書き・2つの CTA が初期表示内にあること
  - キーボード操作、モバイルメニュー
  - reduced-motion で、全コンテンツが表示されること
  - axe で serious / critical の違反がないこと
