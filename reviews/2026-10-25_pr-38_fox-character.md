# コードレビュー記録 — きつねのインタラクティブ SVG キャラクター

- レビューID: REV-20261025-009
- 日時（タイムゾーン）: 2026-10-25（JST）
- レビュアー: Claude Code
- 実装担当: Codex。設計（`docs/ui-design.md` §10、ADR-009）は Claude Code
- PR/Issue URL: https://github.com/21tu/myprofile/pull/38 / #37
- 対象コミットSHA: `31e4626`
- 対応仕様ID: UX-002（ADR-009 で改訂）, FR-008, FR-009, NFR-001, NFR-002, NFR-004
- 判定: `APPROVE`（Claude Code の判定。GitHub 上は COMMENT）

## 2. 検証エビデンス
| 検査 | 結果 | 証跡 |
|---|---|---|
| quality（Vitest 70 passed / 1 skipped ほか） | PASS | CI run 40120816758 |
| e2e（キャラクターへのキーボード操作、両テーマでの表示、axe を含む） | PASS（26 / 26） | 同上 |
| lighthouse（モバイル、3 回） | Perf 0.75 / 0.99 / 0.99（1 回目は TBT 1198ms の起動直後のばらつき）、A11y / BP / SEO 1.00、CLS 0、LCP 1.83s（LCP の要素は h1） | artifact の lhr |
| 実ブラウザ（Claude Code） | 両テーマでコンソール 0 件。瞬き、視線の追従（≤ 6px）、クリック（連打しても重ならない）、スクロールでの表情、フォーカス、reduced で止まること、ライトの輪郭線を確認 | ローカル（新しいサーバー） |
| check:content | 想定どおり FAIL（mascot は placeholder のまま） | ローカル（Codex） |

## 3. 指摘事項
| 指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題 | 影響 | 修正案 | 状態 |
|---|---|---|---|---|---|---|---|
| F-001 | MINOR | NFR-008 | `src/components/character/InteractiveCharacter.tsx`（追従の `pointerleave`） | `window` には `pointerleave` が発生しない | なし（1.5 秒で正面に戻る仕組みがある） | `document.documentElement` の pointerleave を使う | DEFERRED |

## 5. 判断と残存リスク
- 未解決のBLOCKER/MAJOR: なし
- REV-007 F-002（仮画像による LCP と BP）は、この PR で解消（LCP 2.3〜2.8s → 1.83s、BP 0.96 → 1.00）
- オーナーの判断が必要: SVG のデザインを確定（`content.mascot.status: 'confirmed'`）にするかどうか
