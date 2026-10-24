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

## 8. モーション v2（#33、2026-10-25）
既存の §6 を土台にして、質感を上げる。**文章・配色・構成・ルーティングは変えない。新しい依存は追加しない**（Motion と CSS だけを使う）。

### 8.1 共通トークン（`src/app/globals.css` の `:root` と `src/lib/motion.ts` で、同じ値を共有する）
| 名前 | 値 | 用途 |
|---|---|---|
| `--ease-out-expo` / `easeOutExpo` | `cubic-bezier(0.22, 1, 0.36, 1)` | すべての登場・ホバー |
| `--dur-button` | 200ms | ボタンのホバー・押下 |
| `--dur-card` | 300ms | カードのホバー |
| `--dur-reveal` / `reveal.duration` | 600ms | Scroll Reveal |
| `--dur-text` | 700ms | Kinetic Typography（1 語あたり） |
| `reveal.distance` | 24px | Scroll Reveal / Kinetic の移動量 |
| `stagger` | 60ms | カード・単語をずらす間隔 |
| `magnetic.max` | 14px | Magnetic の最大の移動量 |
| `magnetic.spring` | `{ stiffness: 260, damping: 18, mass: 0.6 }` | Magnetic の追従 |

`transform` / `opacity` を基本にする。`filter: blur()` は Kinetic Typography の短い時間だけで使う。

### 8.2 Effect ごとの仕様
1. **Magnetic Hover**（`src/components/motion/Magnetic.tsx`、Client Component）
   - 子要素を包み、ポインターの位置から中心までの差 × 0.3 だけ（最大 14px）移動させる。離れたら spring で戻る。
   - `matchMedia('(hover: hover) and (pointer: fine)')` が true で、かつ reduced-motion でないときだけ有効にする。それ以外は子要素をそのまま返す（ラッパーの DOM を増やさない）。
   - フォーカスやキーボードの操作では動かさない。`pointermove` は rAF でまとめ、アンマウント時にリスナーを外す。
   - `ButtonLink` に `magnetic?: boolean` を追加して使う（Server Component のまま、`magnetic` のときだけ `Magnetic` で包む）。
   - 適用する場所: Header の「問い合わせ」、Hero の CTA 2 つ、Contact のボタン（メール / GitHub / vCard）。
2. **Kinetic Typography**
   - Hero のキャッチコピー: 既存の `.kinetic-word` を、`opacity 0 → 1`、`translateY(24px → 0)`、`blur(6px → 0)`、`--dur-text`、`--ease-out-expo`、60ms ずつずらす、に変える。
   - セクションの h2（`Section`）: 単語に分けた見出しを `Reveal` と同じ条件（画面外のときだけ）で、単語ごとに 60ms ずつ表示する（`KineticHeading`、Client Component）。見出しのアクセシブルネームは元の文と同じにする（`aria-label` は付けず、`span` で分けるだけにして、テキストを連結したときに元の文になるようにする）。
3. **Scroll Reveal**: 既存の `Reveal` の値をトークン（24px / 600ms / easeOutExpo）にする。About の Card、Contact の中身、Work Process の各ステップ（`li`）にも適用する（ステップは 60ms ずつずらす）。SSR では常に表示するという仕様（§6）は変えない。
4. **Glassmorphism**
   - Header: 背景 `navy-950/70`、`backdrop-blur-md` と `backdrop-saturate-150`、下端にハイライトの線（アクセント色 15% → 透明のグラデーション）。
   - スクロールによる変化: `@supports (animation-timeline: scroll())` のときだけ、スクロール量 0〜120px で背景の不透明度と影を増やす（JS は使わない）。対応していないブラウザでは今のまま。
   - モバイルメニューのパネル: 同じガラスの表現にする。
   - 文字と背景のコントラストは今より下げない。
5. **Interactive Gradient**（Hero、`src/components/motion/HeroGradient.tsx`、Client Component）
   - 既存の `.hero-glow`（`Parallax` の中）はそのまま残し、その下に、同じ色調の 2 つ目の放射グラデーションを重ねる。
   - 位置は CSS 変数 `--gx` / `--gy` で決める。`pointermove` は rAF でまとめ、`element.style.setProperty` で更新する（CSSOM を使うので CSP の影響を受けない）。変化はゆっくりにする（CSS transition 600ms）。
   - 時間による変化: CSS keyframes で 20 秒の周期で色の位置をゆっくり動かす。
   - `(pointer: coarse)` と reduced-motion では、ポインターに反応せず、アニメーションもしない（静止したグラデーション）。
   - `aria-hidden`、`pointer-events: none`。文字のコントラストを下げない（不透明度は 0.18 以下）。
6. **Project Card Hover Reveal**（`Projects`）
   - カードにホバーまたは `:focus-within` したとき: 4px 持ち上げる、境界線をアクセント色にする、上から光のハイライト（`::before` のグラデーション）をフェードインする、詳細リンクの矢印を少し右へ動かす。`--dur-card`。
   - カードの高さとレイアウトは変えない（`transform` と `opacity` だけ）。
   - `(hover: none)` では、詳細リンクなどの情報を常に表示する（今も常に表示しているので、隠さない）。
7. **Page Transition**: 採用しない（1 ページ構成のため）。

### 8.3 アクセシビリティと性能
- reduced-motion: 8.2 の動きをすべて止める（静止した最終状態）。
- JS がない環境: すべてのコンテンツが表示され、リンクも動く。
- 追加する Client Component は `Magnetic`、`KineticHeading`、`HeroGradient` の 3 つだけ。セクション自体は Server Component のまま。
- 目標: Lighthouse Performance ≥ 0.9、CLS ≤ 0.1、CSP 違反 0 件。

## 9. Editorial Minimalism（#35、2026-10-25）
コンセプト: **Editorial Minimalism × Interactive Character × Micro Interactions**。配色はネイビーを保つ（ADR-008）。文章・データ・ルーティング・機能は変えない。

### 9.1 タイポグラフィと余白
- h1（Hero の氏名）: `clamp(2.75rem, 8vw, 6.5rem)`、line-height 1.02、`letter-spacing: -0.03em`、weight 800。
- h2（セクション）: `clamp(2.25rem, 6vw, 4.5rem)`、line-height 1.05、`letter-spacing: -0.02em`。
- 本文 1rem〜1.125rem、行間 1.8、1 行の最大幅は 38〜42em。
- セクションの上下の余白: `py-24 md:py-36`。セクションの間は、細い線（`border-t border-line`）で区切る。背景を交互に変えるのは控えめにする。
- **セクションの番号**: 見出しの上に、小さな番号のラベル（例「01」+ 細い線）を置く。装飾なので `aria-hidden`。順番は Services 01、About 02、Skills 03、Projects 04、Process 05、Contact 06。

### 9.2 レイアウト（非対称）
- `md` 以上の各セクション: 12 カラム。左の 4 カラムに番号と見出し、右の 8 カラムに本文。Hero と Projects は例外（下記）。
- **Hero**
  - デスクトップ: 左の 7 カラムに大きな氏名、肩書き、対応業務、キャッチコピー、CTA。右の 5 カラムにキャラクターの領域（#35 では今の `MascotSlot`。次の Issue で SVG のきつねにする）。下端に「スクロール」の誘導（細い線 + 小さな文字。`#services` へのリンク。reduced のときは動かさない）。
  - モバイル: 氏名と CTA を先に出し、キャラクターはその下に置く（文字と重ねない）。375×667 のファーストビューに、氏名と CTA 2 つを入れる。
- **Services**: 番号付きのリスト（01〜04）。各行に、大きめの名前と、細い線で区切った説明を置く。カードは使わない。アイコンは小さく残す。
- **About**: 引用風の大きなリード（既存の文）と、定義リスト（経歴 / 人物紹介 / 趣味）を、細い線で区切る。
- **Skills**: カテゴリのラベル（小さい大文字）と、技術名を大きな文字で並べる（区切りは「 / 」。タグの羅列はやめる）。8 つの技術はすべて表示する。
- **Projects**: 1 件目を大きく（`md:col-span-12`、横長の特集カード）、2 件目以降を 2 カラムにする。Hover Reveal（§8）は残す。
- **Work Process**: 既存のスクロール連動のタイムラインを残し、番号を大きくする。
- **Contact**: 大きな見出し（既存の「Contact」）と、既存の状態の文、CTA（Magnetic）。
- **Header**: 細い。左にサイト名、中央か右にナビ、右に問い合わせ。ガラスの表現（§8）は残す。

### 9.3 テーマ（ADR-008）
- すべての色をトークン（`bg / surface / card / ink / ink-muted / line / accent / on-accent`）で参照する。今の `navy-*` の直接の参照は、トークンに置き換える。
- ライトでは、影を弱くし、線で構造を見せる。グラデーション（§8）はアクセント色の不透明度を下げる（0.10 以下）。
- キャラクター（次の Issue）は、ライトではチャコールを主体に、ダークでは明るいグレーを主体にする。

### 9.4 守ること
- §6・§8 のモーション、reduced-motion、JS がない環境での表示、CSP（style 属性はハッシュで自動的に許可される）をそのまま守る。
- 新しい依存は追加しない。Web フォントも追加しない（システムフォントのまま）。
