# コードレビュー記録 — UI エフェクト改善（モーション v2）

- レビューID: REV-20261025-007
- 日時（タイムゾーン）: 2026-10-25（JST）
- レビュアー: Claude Code
- 実装担当: Codex（Development Team / Testing Team）。設計（`docs/ui-design.md` §8）は Claude Code
- PR/Issue URL: https://github.com/21tu/myprofile/pull/34 / #33
- 対象ブランチ / コミットSHA: `feat/33-ui-effects` / 初回 `f6453c5`、テスト修正後が最新
- 対応仕様ID: FR-008, FR-009, NFR-001〜NFR-004, UX-001
- 判定: `APPROVE`（Claude Code の判定。GitHub 上は COMMENT）

## 2. 検証エビデンス
| 検査 | 結果 | 証跡 |
|---|---|---|
| quality（format / lint / type / Vitest 59 passed / build / prod audit） | PASS | CI run 40118778734 |
| e2e（Playwright + axe、CSP を適用した状態） | 初回 **FAIL**（1 件）→ 修正後 **18 passed** | run 40118402240 → 40118778734 |
| lighthouse（モバイル、3 回） | Perf 0.82 / 0.96 / 0.98（中央値 0.96）、A11y 1.00、BP 0.96、SEO 1.00、CLS 0.000、LCP 2.31〜2.84s | artifact の lhr（ラボの値） |
| 実ブラウザ（Claude Code、Chromium） | コンソールの error / warning 0 件。Magnetic は最大 14px の範囲内で追従し、離すと戻る。ヘッダーのガラスがスクロールで 0.70 → 0.95 に変わる。reduced では動きがすべて止まり、隠れるテキストは 0 件。375 / 1440px で横スクロールなし | ローカル（新しいサーバーで確認） |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題・再現方法 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MAJOR | QA-001, FR-008 | `tests/e2e/portfolio.spec.ts:60` | `appearance()` が祖先の opacity しか見ておらず、`KineticHeading` の単語ごとの opacity を検出できない（CI の e2e が失敗） | 回帰テストが壊れる。製品の動作は正しい | 子孫のテキストまで含めて実効の opacity の最小値を見る補助関数にし、reduced のテストも強化する | RESOLVED（CI 18/18） |
| F-002 | MINOR | NFR-004 | Hero の LCP 要素（仮のマスコット画像。#30 で導入済み） | LCP 2.31〜2.84s（目標 2.5s を 3 回中 2 回で超えた）、Render Delay 2.3s。BP は低解像度の画像の警告で 0.96 | 性能の目標の一部が未達 | SVG のきつねのキャラクターに置き換える作業（次の作業）で LCP 要素が変わるので、そこで再測定する | DEFERRED → キャラクターの Issue |

## 4. 再レビュー履歴
| 日時 | 修正コミット | 指摘ID | 再検証内容・結果 | 判定 |
|---|---|---|---|---|
| 2026-10-25 | テスト修正のコミット | F-001 | CI の 4 ジョブが pass、e2e 18/18 | APPROVE |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- 観察: 検証のとき、先に動いていた古いローカルサーバー（起動時に `_headers` を読み込む作り）が古い CSP のハッシュを返し、CSP 違反と React のエラー #412 が出た。新しいサーバーでは 0 件。**ビルドし直したら、`_headers` を読み直すために、テスト用のサーバーも起動し直すこと**
- Page Transition は 1 ページ構成のため採用しない（Issue #33 に理由を記録）
