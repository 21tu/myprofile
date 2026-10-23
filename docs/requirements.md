# QR名刺ポートフォリオ Webサイト 要件・設計仕様書

- 文書ID: PORT-SPEC-001
- 版: 1.0 / 2026-10-23
- 状態: 実装前ベースライン（未確認のプロフィール・公開情報はTBD）
- 対象: Next.js App Router / TypeScript / Cloudflare Workers Static Assets

## 1. 目的・対象
名刺のQRコードからアクセスする、営業・案件獲得にも使える個人エンジニアのスマートフォン優先ポートフォリオ。訪問者が数秒で「誰か・何を提供できるか・どう連絡するか」を理解できること。誇張した実績・経験年数・資格・連絡先を作らない。

## 2. デザインシステム
- 基調: ダークネイビー #0B1626、サーフェス #111F33、カード #192A40、アクセント #58B8FF、本文 #F5F7FA、補助 #A8B5C5。最終色は実機コントラスト検証で調整。
- 親しみやすいが営業用途に適した上品なタイポグラフィ、明確な情報階層、控えめな装飾。
- きつね: 黄色～橙色、丸い体、茶色ベレー帽、首の黒いヘッドホン、腰の小さなチョークバッグ、ふわふわの尻尾。レモネードは透明グラス、輪切りレモン、ストロー。キャラクターを勝手に改変・生成しない。実画像は別途提供が必要。
- 画面幅: 320pxから横スクロールが生じないこと。モバイル優先で段階的にレイアウト拡張。

## 3. 情報設計
Header（ロゴ、主要ナビ、問い合わせ）→ Hero（肩書き・価値提案・実績/問い合わせCTA）→ Services（Web/AI・画像処理/Cloud/自動化）→ About → Skills → Projects → Work Process → Contact → Footer。
名前、メール、SNS URL、実績の公開可否は設定データから管理し、未確定情報を公開しない。実績は仮データであることを開発中に明示。

## 4. 機能要件と受け入れ基準
| ID | 優先 | 要件 | 受け入れ基準 | 検証 |
|---|---|---|---|---|
| FR-001 | P0 | QRアクセス | HTTPSの公開URLでモバイルからトップ表示 | 実機/E2E |
| FR-002 | P0 | 価値提案 | 初期画面に職種、提供価値、CTAが表示 | 目視/E2E |
| FR-003 | P0 | 問い合わせ | 連絡手段が動作し誤リンクなし | E2E/手動 |
| FR-004 | P0 | 制作実績 | 各カードに名称、概要、技術、詳細導線 | UIテスト |
| FR-005 | P1 | Skills/Services | 設定データで更新できる | 単体テスト |
| FR-006 | P1 | vCard | 正しい連絡先でのみ生成、保存可能 | 手動/単体 |
| FR-007 | P1 | SEO/OGP | title/description/OGP/canonical等を設定 | ビルド検査 |
| FR-008 | P1 | アニメーション | Hero、カード、Projectsに控えめな動き | E2E/目視 |
| FR-009 | P0 | 動きの軽減 | reduced-motionで非必須アニメーション停止 | E2E |
| FR-010 | P0 | 静的配信 | `output: 'export'` のビルド成果物がWorkers Static Assetsで配信可能 | ビルド/プレビュー |

## 5. 非機能要件
| ID | 優先 | 要件 | 受け入れ基準 | 検証 |
|---|---|---|---|---|
| NFR-001 | P0 | アクセシビリティ | WCAG 2.2 AAを目標、既知の重大違反なし。自動検査のみで適合宣言しない | axe + 手動 |
| NFR-002 | P0 | キーボード | 全操作可能、フォーカス視認、適切な順序 | 手動/E2E |
| NFR-003 | P0 | モバイル | 320/375/768/1440pxで破綻・意図しない横スクロールなし | Playwright |
| NFR-004 | P1 | 性能 | LCP≤2.5s、CLS≤0.1、INP≤200msを目標。実測条件と結果を記録 | Lighthouse/実測 |
| NFR-005 | P0 | 型品質 | TypeScript strict、型チェック成功 | CI |
| NFR-006 | P0 | 静的解析 | ESLint/Prettier成功 | CI |
| NFR-007 | P0 | 機密情報 | ソース・ビルド成果物に秘密情報がない | secret scan/手動 |
| NFR-008 | P1 | 保守性 | コンポーネントの責務が明確、不要な抽象化・依存なし | レビュー |

## 6. アニメーション設計
Motion for Reactを基本とし、transform/opacity中心。スクロールジャック、長いイントロ、強制スクロール、常時高負荷WebGLは採用しない。Bento Gridとスクロール連動のProjectsを採用する場合も、コンテンツを非表示のままにしない。タッチ操作をホバーに依存させない。キャラクターのパーツアニメーションは専用素材が揃うまでスコープ外。

## 7. アーキテクチャ
- Next.js App Router、TypeScript strict、Tailwind CSS。静的エクスポートで構築しCloudflare Workers Static Assetsへ配信。
- React Server Componentsを基本とし、インタラクションに必要な範囲だけClient Componentsを採用。
- 初期版にログイン、DB、サーバーAPI、CMSは不要。問い合わせはmailto等の公開連絡先から開始。
- 将来SSR/Server Actionsが必要になった場合は、Cloudflareの現行推奨手段と互換性を再調査し、ADRを作成する。静的エクスポートとSSR前提の機能を混同しない。
- `src/app`, `src/components`, `src/features`, `src/lib`, `src/config`, `src/styles`, `tests`, `docs` を用途に応じて採用。空の抽象レイヤーは作らない。

## 8. セキュリティ設計
OWASP ASVS 5.0の適用項目を要件化し、NIST SSDFを開発プロセスの参考とする。静的サイトで対象外の項目はN/Aとして理由を記録。
| ID | 優先 | 管理策 | 検証 |
|---|---|---|---|
| SEC-001 | P0 | HTTPS/TLS、適切なHSTS（ドメイン運用条件を確認） | 本番ヘッダー確認 |
| SEC-002 | P0 | CSPを実配信に合わせて設計。安易なunsafe-inline/unsafe-evalを避ける | 本番ヘッダー/ブラウザ |
| SEC-003 | P0 | nosniff、Referrer-Policy、Permissions-Policy、frame-ancestors等 | 本番ヘッダー確認 |
| SEC-004 | P0 | 秘密情報のGit・クライアントバンドル混入禁止 | secret scan/成果物検査 |
| SEC-005 | P0 | 依存関係監査、既知の重大・高リスク脆弱性への対処 | CI/レビュー |
| SEC-006 | P0 | Cloudflare/GitHubのMFAと最小権限、デプロイ承認 | 運用チェック |
| SEC-007 | P1 | 外部リンク/スクリプトの安全性、XSSを招く生HTMLの回避 | 静的解析/レビュー |
| SEC-008 | P1 | 問い合わせAPI追加時は入力検証、レート制限、Turnstile、ログ/PII管理 | 将来の設計レビュー |

## 9. 禁止・回避するアンチパターン
理由のないany、ts-ignore、巨大コンポーネント、責務混在、不要なuseEffect/use client、派生state重複、循環依存、マジックナンバー、過剰抽象化、不要な依存、誤ったkey、直接DOM操作、CSS !important乱用、固定幅での画面崩れ、重いアニメーション、スクロールジャック、秘密情報の露出、エラー握りつぶし、テスト結果の捏造。例外は理由・代替案・リスク・追跡課題を記録。

## 10. テスト計画・品質ゲート
PRで `format:check` → `lint` → `typecheck` → `test` → `build` → `e2e` → 依存監査/secret scanを実行。axeは自動検出範囲のみ、キーボードとスクリーンリーダーの手動検査も行う。Lighthouseと実機性能は測定環境を記録。失敗したP0を残したまま本番リリースしない。デプロイは承認制。

## 11. 変更管理
仕様IDをPR本文とテストに対応づける。新たな外部サービス、SSR化、フォーム/個人情報保存、キャラクター変更、セキュリティ緩和はADRと承認を必要とする。設計と実装が矛盾した場合は勝手に推測せず確認する。

## 12. 未確定事項（TBD）
公開名・肩書き・連絡先・独自ドメイン・公開実績・実画像アセット・運用主体・プライバシーポリシー要否。未確定項目は本番に架空データを掲載しない。

## 13. 参照標準
WHATWG HTML Living Standard / WCAG 2.2 / OWASP ASVS 5.0 / OWASP Top 10 / NIST SP 800-218 SSDF / Next.js・Cloudflare公式ドキュメント / Google Core Web Vitals。適合認証を主張するものではなく、採用・検証の基準とする。

## 14. デザイン・開発プロセス要件
`myprofile-workflow` の仕様書から統合した要件。上記の章に該当IDがないものだけを追加する。

| ID | 優先 | 要件 | 受け入れ基準 | 検証 |
|---|---|---|---|---|
| FR-011 | P0 | セクション構成 | Hero/Services/About/Skills/Projects/Work Process/Contact/Footer を備える（§3） | UIテスト/ウォークスルー |
| UX-001 | P1 | 配色 | §2のダークネイビー配色を適用し、複数画面幅で確認 | 目視 |
| UX-002 | P0 | マスコット一貫性 | きつね（ベレー帽/ヘッドホン/チョークバッグ/ノートPC/レモネード）を提供素材のまま使い、代替画像を捏造しない | 素材レビュー |
| QA-001 | P0 | CI品質ゲート | format:check / lint / typecheck / test / build / 依存監査がGitHub Actionsの必須チェックとして動作 | GitHub Actions |
| REV-001 | P0 | レビュー記録 | Claude CodeがPRへ行単位の指摘を残し、解決結果を `reviews/` に記録 | PRレビュースレッド + `reviews/` |
| DOC-001 | P1 | トレーサビリティ | Issue → PR → コミット → テスト → レビューが相互にリンク | Issue/PR/ADR/`docs/traceability.md`/note開発ログ |

KISS / YAGNI / DRY を実用的に適用する（§9のアンチパターンも参照）。

## 15. 旧仕様IDとの対応表
統合前の `docs/specification.md`（myprofile-workflow）のIDは本書の以下のIDに読み替える。旧IDは新規のIssue・PRで使わない。

| 旧ID | 本書のID |
|---|---|
| FR-001 | FR-001, NFR-003 |
| FR-002 | FR-002 |
| FR-003 | FR-011 |
| FR-004 | FR-004 |
| FR-005 | FR-003, FR-006 |
| UX-001 | UX-001 |
| UX-002 | UX-002 |
| UX-003 | FR-008, FR-009 |
| A11Y-001 | NFR-001, NFR-002 |
| PERF-001 | NFR-004 |
| ARCH-001 | FR-010, NFR-005 |
| SEC-001 | SEC-001, SEC-002, SEC-003, SEC-004 |
| SEC-002 | SEC-005, SEC-006, SEC-007, SEC-008（ASVS/SSDFの適用は§8） |
| QA-001 | QA-001 |
| REV-001 | REV-001 |
| DOC-001 | DOC-001 |
