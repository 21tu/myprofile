# myprofile

名刺のQRコードから開く、モバイル優先のエンジニアポートフォリオ（Next.js × Cloudflare Workers Static Assets）。
Codexが実装し、**Claude Codeが正式にコードレビュー**する。仕様・判断・レビュー結果を後から追跡できるようにする。

> 現在は**設計フェーズ**。アプリケーションコードはまだなく、本番デプロイもしていない。

## 最初に読む順番
1. `docs/requirements.md`：何を作るか／受け入れ基準（仕様IDの正本）
2. `docs/architecture-decisions.md`：なぜその設計にしたか（ADR）
3. `CLAUDE.md`：Claude Codeの責任と手順
4. `AGENTS.md`：Codexの実装責任
5. `docs/review-policy.md`：Issue・ブランチ・PR・レビューの運用
6. `docs/code-review-checklist.md`：チェック項目
7. `docs/review-record-template.md`：レビュー記録フォーマット
8. `docs/review-index.md`：レビュー履歴
9. `docs/traceability.md`：仕様IDからコード・テストへの対応
10. `note/`：note記事の作成手順・下書き・公開キット・開発ログテンプレート（`note/article-procedure.md` から読む）

## 毎回の流れ
Issue作成 → 専用ブランチ → Codex実装・テスト → Draft PR → GitHub Actions → **Claude Code差分レビュー** → 指摘修正 → 再レビュー → 記録・台帳更新 → 人間のマージ/デプロイ承認。

## ディレクトリ
| パス | 内容 |
|---|---|
| `.github/` | Issue/PRテンプレート、品質チェックワークフロー |
| `docs/` | 要件、ADR、レビュー運用・チェックリスト・テンプレート、トレーサビリティ |
| `reviews/` | レビュー記録（追記のみ。過去の判断を上書きしない） |
| `note/` | note記事の下書き、画像、開発ログテンプレート |
| `scripts/` | CI注釈スクリプト、初期Issue作成スクリプト |

## セットアップ（GitHub）
- 初期タスクのIssueは `bash scripts/create-issues.sh 21tu/myprofile` で作成できる（`gh auth login` 済みでIssue書き込み権限が必要。同じタイトルのIssueがあればスキップ）。
- ブランチ保護で品質チェックとレビュー承認を必須にする（`docs/review-policy.md` の10を参照）。

## 自動チェックとレビューの違い
GitHub Actionsは `::error file=...,line=...,col=...::...` 形式で診断を出し、Checksに該当箇所を表示する。Claude Codeはこれとは別にPR差分を読み、インラインレビューコメントを投稿して記録を残す。

## 運用注意
コミットSHA・日時・テスト結果を記録し、過去の判断を上書きして消さない。設計変更はADRに追加する。note原稿は実装の証拠ではない。
