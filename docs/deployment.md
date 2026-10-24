# デプロイ手順（ステージング / 本番）

- 対象 Issue: #31 / ADR-007
- 方針（オーナーの決定、2026-10-24）:
  - 公開するのは**ステージングだけ**（Cloudflare の workers.dev）。
  - デプロイは GitHub Actions で行い、**手動の承認**を必要にする。
  - 本番は、内容が確定して `npm run check:content` が通るまで公開しない。

## 構成
| 環境 | Worker 名 | URL | 検索エンジン | 承認 |
|---|---|---|---|---|
| staging | `myprofile-staging` | `https://myprofile-staging.<アカウントのサブドメイン>.workers.dev` | `X-Robots-Tag: noindex, nofollow`（検索に載せない。**アクセス制限ではない**） | GitHub Environment `staging` の承認者 |
| production | `myprofile` | 未設定（独自ドメインは未決定。workers.dev も無効） | 付けない | GitHub Environment `production` の承認者 + `check:content` が通ること |

- 設定: `wrangler.jsonc`（トップレベルが本番、`env.staging` がステージング）
- ワークフロー: `.github/workflows/deploy.yml`（`workflow_dispatch` だけ。自動デプロイはしない）
- ビルド: staging は `npm run build:staging`（noindex を付ける）、production は `npm run build`

## 初回セットアップ（オーナーが行う）
### 1. Cloudflare
1. https://dash.cloudflare.com/sign-up でアカウントを作る（無料プランで可）。
2. **Account ID** を控える（ダッシュボードの右側、または Workers & Pages の概要に表示される）。
3. **API トークン**を作る: My Profile → API Tokens → Create Token → テンプレート「**Edit Cloudflare Workers**」。
   - Account Resources は、自分のアカウントだけにする。Zone Resources は不要（独自ドメインを使わないため、All zones を外す）。
   - 有効期限を設定することを推奨する。
   - トークンは一度しか表示されない。チャットやファイルに貼らないこと。

### 2. GitHub（Environments と Secrets）
1. https://github.com/21tu/myprofile/settings/environments で、`staging` と `production` の Required reviewers に自分（21tu）が入っていることを確認する（Claude Code が設定済み）。
   - 承認できるのはオーナー一人なので、「Prevent self-review」は**オフのまま**にする（オンにすると、自分で起動したデプロイを自分で承認できなくなる）。
2. 各 Environment の **Environment secrets** に、次の 2 つを登録する。
   - `CLOUDFLARE_API_TOKEN`: 1-3 で作ったトークン
   - `CLOUDFLARE_ACCOUNT_ID`: 1-2 の Account ID
   - 本番の公開まで production には登録しない、という運用でもよい。

## ステージングへのデプロイ
1. https://github.com/21tu/myprofile/actions/workflows/deploy.yml → **Run workflow** → `target: staging` → Run。
2. 実行が「Waiting」になったら、**Review deployments** → `staging` にチェック → **Approve and deploy**。
3. 完了すると、ジョブの Environment URL にステージングの URL が表示される。ログには、HTTP ステータス、`X-Robots-Tag`、CSP ヘッダーの数だけが出る。

## 本番へのデプロイ（現時点では実行しない）
- 前提: `src/config/content.ts` の仮データがすべて `confirmed` になっていること（マスコットの正式画像（#29）も含む）、独自ドメインを決めていること、オーナーが明示的に承認すること。
- `target: production` で実行すると、最初に `npm run check:content` が動き、仮データが残っていればそこで失敗する。
- 独自ドメインを使うときは、`wrangler.jsonc` に routes / custom domain を追加する。HSTS の見直しも ADR-005 で行う。

## ロールバック
- Cloudflare ダッシュボード → Workers & Pages → 該当の Worker → Deployments から、前のバージョンに戻せる。
- または、戻したいコミットで deploy ワークフローを再実行する。

## 確認していないこと
- 実際のデプロイと、公開されたステージングのヘッダー（オーナーがトークンを登録したあとに確認する）
- `wrangler deploy --env staging --dry-run` は成功済み（38 ファイル、認証なしで検証。2026-10-24）
