# プルリクエスト・コードレビュー運用

チェック項目は `docs/code-review-checklist.md`、記録の書式は `docs/review-record-template.md` を使う。

1. 各タスクは、範囲とテスト可能な受け入れ条件を持つIssueから始める（`.github/ISSUE_TEMPLATE/task.yml`）。
2. ブランチ名: `feat/<issue>-topic`、`fix/<issue>-topic`、`chore/<issue>-topic`、`docs/<issue>-topic`。`main` へ直接コミットしない。
3. PRタイトル: `type(scope): change (#issue)`。本文は `.github/pull_request_template.md` に従い、完了時に `Closes #N` を含める。最初はDraftで作成する。
4. GitHub Actions（`.github/workflows/quality.yml`）は lint と TypeScript エラーをファイル/行の注釈として出し、その他のテスト失敗はChecksで報告する。差分外の行はインラインコメントではなくChecksの注釈にのみ表示される場合がある。
5. Claude CodeはPR差分とテストログを独立に読み、行単位のインラインレビューコメント（GitHub PR review API / `gh api`）と総評を残す。Actionsは自動化であり、AIレビューの代替ではない。`CLAUDE.md` を置いただけでGitHub上のレビューは起動しない。Claude Codeは認可された連携またはローカル実行で動かす。
6. 指摘の書式: `[SEVERITY] [SPEC-ID] file:line — 問題 / 影響 / 推奨修正 / 検証方法`。記録上は `指摘ID | 重大度 | 仕様ID | ファイル:行 | 問題 | 影響 | 修正案 | 状態` で追跡する。
7. 重大度: BLOCKER / MAJOR は承認不可。MAJOR は修正するか、承認済みの例外として記録する。MINOR は修正推奨で、後回しにする場合はIssueにリンクする。
8. 変更後は再レビューし、ヘッドSHA、チェック結果、指摘と解決状況を `reviews/YYYY-MM-DD_pr-<番号>_<topic>.md` に記録して `docs/review-index.md` を更新する。
9. チェックが通っていても、ユーザーの明示的な許可なしにマージ・デプロイしない。
10. リポジトリのブランチ保護/ルールセットを手動で確認する：CI必須、レビュー承認必須、可能ならforce push禁止。Next.jsのscaffoldが入るまで品質ジョブは警告を出してスキップするため、scaffold Issueの完了後にビルドゲートを必須化する。
