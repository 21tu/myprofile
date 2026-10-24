# note development log — 開発ワークフローの整備

- Date: 2026-10-24（JST）
- GitHub Issue / PR: #1 / #2、#3 / #4、#5（本記事）、初期タスク #6〜#11
- Goal and design context: 事前に用意した2つの資料（`portfolio-spec`、`myprofile-workflow`）を統合し、Issue → ブランチ → Draft PR → CI → レビュー の流れをリポジトリに用意する。
- Architecture decision and alternatives:
  - 仕様IDは `docs/requirements.md` を正とした。workflow 側の `docs/specification.md` はIDが衝突していたため置かず、§15 に対応表を付けた。
  - 重大度は BLOCKER/MAJOR/MINOR、レビュー記録は `reviews/`、ADRは `docs/architecture-decisions.md` に統一した。
  - 一人で運用しているため、ブランチ保護は `enforce_admins: false` にした（自分のPRを自分では承認できないため）。
- What Codex implemented (only verified facts): なし。この段階ではCodexを使っていない。作業はすべてClaude Codeが行った。
- Claude review: findings and fixes: 正式レビューは未実施（作成者自身による変更のため、オーナーの確認を優先）。
- Commands run and results:

| 区分 | 内容 | 根拠 |
|---|---|---|
| 実装済み | GitHub CLI 2.103.0 を winget で導入 | winget の出力 |
| 実装済み | `gh auth login --web` でデバイス認証（scope: repo, read:org, gist） | `gh auth status` |
| 実装済み | 統合コミット | `7f618da`（PR #2） |
| 実装済み | note 作成手順書 | `45eed86`（PR #4） |
| 検証済み | PR #2 の quality が pass（6秒）。scaffold がないため警告を出してスキップ | Actions run 39981403565 |
| 検証済み | PR #4 の quality が pass（5秒） | Actions run 39981820837 |
| 検証済み | `_setup/` がコミットに含まれない | `git check-ignore`、`git ls-tree` で0件 |
| 実装済み | `scripts/create-issues.sh` で Issue #6〜#11 を作成 | Issue URL |
| 実装済み | main のブランチ保護（quality 必須・最新化必須、承認1件、古い承認の破棄、会話の解決必須、force push・削除の禁止） | `gh api .../branches/main/protection` のレスポンス |
| 予定 | Codex との接続確認、#6 の実装開始、Claude Code のレビュー記録 | `CLAUDE.md` |

- つまずいたこと:
  1. `gh` が入っていなかった → winget で導入した。
  2. Claude Code の `!` プレフィックスは bash で動くため、PowerShell の `&` を付けたコマンドが構文エラーになった。
  3. デバイス認証はブラウザでコードを入力するまで終わらないため、コマンドがタイムアウトしてバックグラウンドに回った。認証後に完了した。
  4. git のユーザー名とメールアドレスが未設定でコミットに失敗した → 最初のコミットと同じ作成者を、リポジトリだけの設定として登録した。この間、変更を含まない状態のブランチが一度だけ push された。
- Images/screenshots approved for publication: `note/images/ex1-workflow-overview.png`（Claude Code が HTML で作った図をスクリーンショットしたもの。実際に通した流れだけを描いた）→ 公開可否はオーナーが判断する
- Security-sensitive information removed: トークン、メールアドレス、ローカルの絶対パスは記事に書かない。
- Lessons and next article outline: 第2回で Next.js × Cloudflare の土台（#6）を扱う。
