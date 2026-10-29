# 要件トレーサビリティ台帳

Claude Code が各PRで更新する。仕様書（`docs/requirements.md`）の全IDを対象に、実装・テスト・レビューの参照先を記録する。

- **状態の区分:** 未着手 / 実装中 / レビュー中 / 合格（PR未マージ）/ 合格 / 差戻し / 保留
- **「合格（PR未マージ）」の意味:** Claude Code のレビューで APPROVE し、CI も通過しているが、オーナーがまだマージしていない状態。本番には公開していない。
- **最終更新:** 2026-10-24（JST）。CI の証跡は run 40038369430（PR #26）。
- PRの積み重ね（スタック）: #2 → #22 → #23 → #24 → #25 → #26 → #11 のPR

| 仕様ID | 要件概要 | 実装ファイル | テスト | PR / レビューID | 状態 |
|---|---|---|---|---|---|
| FR-001 | QRアクセス（モバイルでトップ表示） | `src/app/page.tsx`, `src/components/sections/Hero.tsx` | E2E「FR-001 FR-002: name and hero CTAs fit…」 | #23 / REV-003 | 合格（PR未マージ）。本番URLは未公開 |
| FR-002 | 初期画面に職種・提供価値・CTA | `src/components/sections/Hero.tsx` | E2E 同上、`tests/unit/page.test.tsx` | #23 / REV-003 | 合格（PR未マージ） |
| FR-003 | 問い合わせ（誤リンクなし） | `src/components/sections/Contact.tsx` | E2E「FR-003 FR-006: placeholder contact…」、`page.test.tsx` | #23 / REV-003 | 合格（PR未マージ）。連絡先が仮データのため、リンクは出さない |
| FR-004 | 制作実績カード | `src/components/sections/Projects.tsx` | `page.test.tsx`（`href: null` ならリンクなし） | #23 / REV-003 | 合格（PR未マージ）。実績は仮データ |
| FR-005 | Skills / Services を設定データで管理 | `src/config/content.ts`, `src/config/types.ts`, `src/lib/content-check.ts` | `tests/unit/content-check.test.ts` | #22 / REV-002、#23 / REV-003 | 合格（PR未マージ） |
| FR-006 | vCard | `src/lib/vcard.ts`, `scripts/generate-vcard.mjs` | `tests/unit/vcard.test.ts`、E2E（仮データのときは出力しない） | #23 / REV-003 | 合格（PR未マージ）。確定データでの生成は fixture でのみ確認 |
| FR-007 | SEO / OGP | `src/app/layout.tsx`（title / description のみ） | Lighthouse SEO 1.00 | #23 | **実装中**（OGP と canonical は独自ドメインの決定待ち） |
| FR-008 | アニメーション | `src/components/motion/*`, `src/app/globals.css` | `tests/unit/motion.test.tsx`、E2E「FR-008: offscreen Contact reveals…」 | #24 / REV-004 | 合格（PR未マージ） |
| FR-009 | reduced-motion | 同上 | `tests/unit/motion-reduced.test.tsx`、E2E「FR-009: reduced motion…」 | #24 / REV-004 | 合格（PR未マージ） |
| FR-010 | 静的配信（export + Workers Static Assets） | `next.config.ts`, `wrangler.jsonc` | build（CI）、E2E（404 / JS なし）、`wrangler dev --local` での確認 | #22 / REV-002 | 合格（PR未マージ）。本番デプロイは未実施 |
| FR-011 | セクション構成 | `src/components/sections/*`, `MobileMenu.tsx` | E2E「FR-011: navigation reaches every section」（375 / 1440） | #23 / REV-003、#26 / REV-006 | 合格（PR未マージ） |
| NFR-001 | アクセシビリティ（WCAG 2.2 AA を目標） | 全UI | E2E の axe（serious / critical 0 件）、Lighthouse A11y 1.00 | #23 / REV-003、#26 / REV-006 | 合格（PR未マージ）。**自動検査のみ。手動の検査とスクリーンリーダーでの確認は未実施で、適合は主張しない** |
| NFR-002 | キーボード操作 | `globals.css`（フォーカス）、`MobileMenu.tsx` | E2E「NFR-002: skip link…」、`tests/unit/mobile-menu.test.tsx` | #26 / REV-006、#39 / REV-20261029-001 | 合格（PR未マージ）。UX監査の MINOR（A-002 / A-003：メニューの閉じ方とフォーカス）は #41 / REV-20261029-002 で APPROVE（PR未マージ） |
| NFR-003 | 320〜1440px で崩れない | 全UI | E2E「NFR-003: no horizontal overflow」 | #23 / REV-003、#26、#39 / REV-20261029-001 | 合格（PR未マージ）。横スクロールなし。UX監査の MINOR（A-001：320px でヘッダーの CTA が折り返す、A-004：見出しの改行）は #41 / REV-20261029-002 で APPROVE（PR未マージ） |
| NFR-004 | 性能（LCP ≤ 2.5s、CLS ≤ 0.1、INP ≤ 200ms） | — | Lighthouse CI（モバイル、ラボ）: LCP 2.27〜2.43s、CLS 0.000 | #26 / REV-006 | 合格（PR未マージ）。**フィールドの値と INP は未測定** |
| NFR-005 | 型品質 | `tsconfig.json`（strict + noUncheckedIndexedAccess） | CI typecheck | #22 / REV-002 | 合格（PR未マージ） |
| NFR-006 | 静的解析 | `eslint.config.mjs`, `.prettierrc.json`, `.gitattributes` | CI の lint / format:check | #22 / REV-002 | 合格（PR未マージ） |
| NFR-007 | 機密情報の混入防止 | `.gitignore`（`.env*` 等） | CI の gitleaks（no leaks） | #25, #26 | 合格（PR未マージ） |
| NFR-008 | 保守性 | 全体 | 各レビュー | REV-002〜006 | 合格（PR未マージ） |
| SEC-001 | HTTPS / HSTS | `scripts/lib/csp.mjs`（HSTS） | ローカルの wrangler でヘッダーを確認 | #25 / REV-005 | 合格（PR未マージ）。**本番の TLS とヘッダーは未検証** |
| SEC-002 | CSP | `scripts/lib/csp.mjs`, `scripts/generate-headers.mjs` | `tests/unit/csp.test.ts`、E2E「SEC-002: CSP is enforced…」 | #25 / REV-005 | 合格（PR未マージ） |
| SEC-003 | 各種セキュリティヘッダー | 同上 | wrangler + curl | #25 / REV-005 | 合格（PR未マージ） |
| SEC-004 | 秘密情報の混入防止 | `.gitignore` | gitleaks | #25, #26 | 合格（PR未マージ） |
| SEC-005 | 依存関係の監査 | `.github/workflows/quality.yml` | prod audit 0 件（失敗したら止める）、全依存関係の監査は警告のみ | #26 / REV-006 | 合格（PR未マージ）。開発用の依存関係にある high は #27 で追跡 |
| SEC-006 | MFA・最小権限・デプロイ承認 | ブランチ保護（main） | 設定の確認（必須チェック 4 つ、承認 1 件） | — | 実装中（GitHub と Cloudflare の MFA は人間が確認する） |
| SEC-007 | 外部リンク・XSS の回避 | `src/components/ui/ButtonLink.tsx` | `page.test.tsx` | #23 / REV-003 | 合格（PR未マージ） |
| SEC-008 | 問い合わせAPI（将来） | — | — | — | 保留 |
| UX-001 | 配色 | `src/app/globals.css`（`@theme`） | 目視（`note/images/impl-ui-*.png`） | #23 / REV-003 | 合格（PR未マージ） |
| UX-002 | マスコットの一貫性 | `src/components/ui/MascotSlot.tsx`（枠のみ） | `page.test.tsx` | #23 / REV-003 | **保留**（正式画像の提供待ち。代わりの画像は使わない） |
| QA-001 | CI の品質ゲート | `.github/workflows/quality.yml` | CI の 4 ジョブ | #2, #22, #26 | 合格（PR未マージ）。main の必須チェックに設定済み |
| REV-001 | レビュー記録 | `reviews/`, `docs/review-index.md` | — | REV-001〜006 | 合格（運用中） |
| DOC-001 | トレーサビリティ | 本台帳、ADR-001〜005、`note/` | — | #1, #3, #5, #11 | 実装中 |
