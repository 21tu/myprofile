# コードレビュー記録 — UX監査の MINOR 改善（#40）

- レビューID: REV-20261029-002
- 日時（タイムゾーン）: 2026-10-29（JST）
- レビュアー: Claude Code
- 実装担当: Codex（サンドボックスから `.git` に書き込めなかったため、コミットは Claude Code が内容を変えずに代行）
- PR/Issue URL: https://github.com/21tu/myprofile/pull/41 / https://github.com/21tu/myprofile/issues/40
- 対象ブランチ / コミットSHA: `fix/40-ux-audit-minor` / `eaca864`（ベースは `feat/37-fox-character`）
- 対応仕様ID: NFR-002, NFR-003, FR-002, FR-003, FR-008, FR-009, UX-002
- 変更概要・背景: UX監査 REV-20261029-001 の A-001〜A-005、A-008 への対応。A-005 は 2026-10-29 のオーナー決定（モバイルではきつねを小さくし、登場の動きで目立たせる。形・色は変えない）
- 参照ADR: ADR-009。設計: `docs/ui-design.md` §4, §10.7
- 判定: `APPROVE`（2026-10-29、`bfe0422`。初回 `eaca864` は REQUEST_CHANGES。自分のアカウントの PR なので、GitHub 上は COMMENT で投稿）

## 1. 変更差分
| ファイル | 変更内容 | 理由 | 仕様ID |
|---|---|---|---|
| `src/components/sections/Header.tsx` | CTA を `shrink-0 whitespace-nowrap` で包み、secondary に。サイト名を `truncate` | A-001, A-008 | NFR-003, FR-002, FR-003 |
| `src/components/sections/MobileMenu.tsx` | 開いている間だけ、外側の `pointerdown` と `scroll` で閉じる。リンクで閉じたら移動先の見出しへフォーカス | A-002, A-003 | NFR-002 |
| `src/components/motion/KineticHeading.tsx` | 見出しに `tabIndex={-1}` と `scroll-mt-24` | A-003 | NFR-002 |
| `src/app/globals.css` | `h1, h2` に `word-break: auto-phrase` / `text-wrap: balance`。きつねの登場（`fox-enter` 600ms）とあいさつ（`fox-wave` 700ms、600ms 後） | A-004, A-005 | NFR-003, FR-008, FR-009 |
| `src/components/character/InteractiveCharacter.tsx` | 最大幅をモバイル 10rem / `md` 以上 22rem | A-005 | FR-002, UX-002 |
| `tests/unit/mobile-menu.test.tsx`, `tests/e2e/issue40.spec.ts` | 閉じ方・フォーカス・CTA・きつね・reduced-motion・JS なしのテスト | — | 同上 |

## 2. 検証エビデンス
| 検査 | コマンド / 手順 | 結果 PASS/FAIL/未検証 | 実行環境・証跡 |
|---|---|---|---|
| Format | `npm run format:check` | PASS | ローカル Windows 11、Node 22.14.0、`eaca864` と同じ作業ツリー |
| Lint | `npm run lint` | PASS | 同上 |
| Typecheck | `npm run typecheck` | PASS | 同上 |
| Unit | `npm test` | PASS（72 passed / 1 skipped） | 同上 |
| Build / static export | `npm run build` | PASS（index.html のインライン style は 14 / 10 種類で変化なし） | 同上 |
| E2E / viewport | `npx playwright test`（一時的な設定で Chrome 安定版を使い、新しくビルドしたサーバーを 4211 番で配信） | **FAIL**（36 passed / 2 failed: F-002, F-003） | 4173 番には古いサーバーが残っていて CSP のハッシュが古かったため、別のポートで実行した |
| axe + 手動a11y | E2E の axe（375 / 1440） | PASS。手動ではキーボード（F-003）と、きつねのリアクション（F-001）を確認 | 同上 |
| Security / dependency / secret | 依存・CSP・ヘッダーの変更なし | 対象外 | — |
| Cloudflare preview / headers | — | 未検証 | — |
| Lighthouse / 実機 | — | 未検証（CI で確認） | — |

目視（Chrome、Claude Code が撮影）: 320px でヘッダーの CTA が1行（高さ 47px）、横スクロール 0。375×740 で、きつね（160px）の全体が1画面目に入る（下端 654px）。1440px で「氏名 /（準備中）」と語のまとまりで改行される。

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | FR-008（§10.3） | `src/app/globals.css:409-411` | 登場のあいさつとクリックの `wave` が同じ `fox-wave` を使うので、`data-reaction="wave"` になっても `animation-name` が変わらず再開されない。Chrome で `.paw` の `getAnimations()` が空になることを確認（要素を作り直すと running） | クリックの4種類のリアクションのうち、wave が二度と再生されない | あいさつ用に `@keyframes fox-greet` を分ける。wave のときは `fox-greet …, fox-wave …` と一覧に追加する。E2E で、登場のあとの wave で `.paw` のアニメーションが running であることを確かめる | RESOLVED（b18e0d4） |
| F-002 | MAJOR | NFR-002, FR-011 | `src/components/sections/MobileMenu.tsx:30-34` | スクロールが1回でも起きると閉じるので、スムーズスクロールの途中に開くと 400ms 以内に閉じる。既存の E2E「FR-011: navigation reaches every section」（375px）がタイムアウトする | メニューから続けて移動できない。CI が失敗する | 開いたときの `scrollY` から 48px 程度以上動いたときだけ閉じる。ユニットテストを追加する | RESOLVED（440d654） |
| F-003 | MAJOR | NFR-002 | `src/components/sections/MobileMenu.tsx:66-70` | クリックのハンドラーの中で見出しにフォーカスしても、続くフラグメント移動でフォーカスが外れる。`issue40.spec.ts` の keyboard のテストが `Received: inactive` で失敗する | A-003 の受け入れ条件を満たしていない | ナビゲーションが終わってからフォーカスする（次のフレーム、または `hashchange` のあと） | RESOLVED（b18e0d4） |
| F-004 | MINOR | QA-001 | `tests/e2e/issue40.spec.ts:87`, 1行目 | URL を `http://127.0.0.1:4173/` に固定している。ファイルの先頭に BOM がある | `baseURL` を変えたときに、古いサーバーなど別の対象を検査してしまう | `test.use({ javaScriptEnabled: false })` と `page.goto('/')`。BOM を取り除く | RESOLVED（b18e0d4） |
| F-005 | MINOR | QA-001 | `tests/e2e/issue40.spec.ts:15` | `boundingBox()` が自動で待たないため、ハイドレーションで要素が差し替わる瞬間に null を返す。`--repeat-each=10` で 1 / 80 が失敗 | CI がまれに理由なく失敗する | `toBeVisible()` のあと `expect.poll` で高さを待つ | RESOLVED（bfe0422） |

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-29 | b18e0d4 | F-001〜F-004 | format / lint / typecheck / unit（73 passed）/ build PASS。E2E 全件 39 passed（Chrome、新しいサーバー 4211）。F-001: wave のとき `.paw` が running。F-003: キーボードで移動後に Contact の見出しにフォーカス。F-004: 固定 URL と BOM がなくなった。**F-002: 48px のしきい値では、スムーズスクロールの途中に開くと閉じる。`FR-011 --repeat-each=15` で 7 / 30 失敗（375px）** → `wheel` で閉じる方式に変えるよう依頼 | REQUEST_CHANGES |
| 2026-10-29 | 440d654 | F-002 | `scroll` をやめて `wheel` で閉じる方式に変更。E2E 全件 39 passed、`FR-011 --repeat-each=10` で失敗 0。新たに F-005（CTA のテストの不安定さ、1 / 80）を見つけた | REQUEST_CHANGES（F-005 のため） |
| 2026-10-29 | bfe0422 | F-005 | format / lint / typecheck / unit（73 passed）/ build PASS。新しくビルドし直したサーバー（4211）で E2E 全件 39 passed、`-g "FR-011|header CTA stays" --repeat-each=15` で 165 passed / 0 failed（Chrome 155、`channel: chrome`）。途中、Codex がビルドをやり直したために古い CSP ヘッダーのサーバーで 12 件失敗した実行があったが、環境の問題としてやり直した | APPROVE |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 例外・リスク受容（承認者と理由）: なし
- 未検証事項: Lighthouse（CLS / Performance。CI で確認）、実機（iOS Safari の慣性スクロールとタッチでのメニュー）、Chrome 以外のブラウザ、スクリーンリーダー
- 次のアクション: GitHub Actions の結果を確認する。オーナーのマージ承認を待つ（ベースは PR #38 のブランチ）。Codex のサンドボックスから `.git` に書き込めない件と、Windows で `CreateProcessWithLogonW failed: 1909` が出て Codex の実行が途中で止まった件は、運用上の課題として残す
- 本番デプロイ承認: 未取得

> 記録には秘密情報・個人情報・本番トークンを記載しない。検証していない事項をPASSにしない。
