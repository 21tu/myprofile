# レビュー履歴一覧

レビュー実施ごとにClaude Codeが更新する。古い結果を上書きせず、記録へのリンクと対象コミットを残す。

| レビューID | 日付 | 対象 | コミットSHA | 判定 | 未解決件数 | 記録 |
|---|---|---|---|---|---|---|
| REV-20261024-001 | 2026-10-24 | PR #2 セットアップ統合 | 7f618da → 修正コミット | COMMENT（指摘は全件解消） | 0 | `reviews/2026-10-24_pr-2_setup-integration.md` |
| REV-20261024-002 | 2026-10-24 | PR #22 Next.js の土台 | a8c329a → 6178b28 | APPROVE（Claude Code の判定。GitHub 上は COMMENT） | 0（MINOR 1件は #17 へ） | `reviews/2026-10-24_pr-22_nextjs-scaffold.md` |

## 判定ルール
- `APPROVE`: BLOCKER/MAJORが解消し、必須検査の結果を確認済み。
- `REQUEST_CHANGES`: BLOCKER/MAJORが残る、または必須検査が失敗。
- `COMMENT`: 確認・情報不足。承認とはみなさない。
- 未検証はPASSではない。例外は人間の承認と理由を記録する。
