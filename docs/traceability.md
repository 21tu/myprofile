# 要件トレーサビリティ台帳

Claude Codeが各PRで更新。仕様書（`docs/requirements.md`）の全IDを対象に、実装・テスト・レビューの参照先を追記する。

| 仕様ID | 要件概要 | 実装ファイル | テスト | レビューID | 状態 |
|---|---|---|---|---|---|
| FR-001 | QRアクセス | TBD | TBD | — | 未着手 |
| FR-002 | Hero価値提案 | TBD | TBD | — | 未着手 |
| FR-003 | 問い合わせ | TBD | TBD | — | 未着手 |
| FR-004 | 制作実績 | TBD | TBD | — | 未着手 |
| FR-005 | Skills/Services設定データ | TBD | TBD | — | 未着手 |
| FR-006 | vCard | TBD | TBD | — | 未着手 |
| FR-007 | SEO/OGP | TBD | TBD | — | 未着手 |
| FR-008 | アニメーション | TBD | TBD | — | 未着手 |
| FR-009 | reduced-motion | TBD | TBD | — | 未着手 |
| FR-010 | 静的配信 | TBD | TBD | — | 未着手 |
| FR-011 | セクション構成 | TBD | TBD | — | 未着手 |
| NFR-001 | アクセシビリティ | TBD | TBD | — | 未着手 |
| NFR-002 | キーボード操作 | TBD | TBD | — | 未着手 |
| NFR-003 | モバイル | TBD | TBD | — | 未着手 |
| NFR-004 | 性能 | TBD | TBD | — | 未着手 |
| NFR-005 | 型品質 | TBD | TBD | — | 未着手 |
| NFR-006 | 静的解析 | TBD | TBD | — | 未着手 |
| NFR-007 | 秘密情報保護 | TBD | TBD | — | 未着手 |
| NFR-008 | 保守性 | TBD | TBD | — | 未着手 |
| SEC-001 | HTTPS/HSTS | TBD | TBD | — | 未着手 |
| SEC-002 | CSP | TBD | TBD | — | 未着手 |
| SEC-003 | セキュリティヘッダー | TBD | TBD | — | 未着手 |
| SEC-004 | 秘密情報の混入防止 | TBD | TBD | — | 未着手 |
| SEC-005 | 依存関係監査 | `.github/workflows/quality.yml` | TBD | — | 実装中 |
| SEC-006 | MFA・最小権限・デプロイ承認 | 運用 | 運用チェック | — | 未着手 |
| SEC-007 | 外部リンク/スクリプト安全性 | TBD | TBD | — | 未着手 |
| SEC-008 | 問い合わせAPI（将来） | — | — | — | 保留 |
| UX-001 | 配色 | TBD | TBD | — | 未着手 |
| UX-002 | マスコット一貫性 | TBD | TBD | — | 未着手 |
| QA-001 | CI品質ゲート | `.github/workflows/quality.yml`, `scripts/annotate-log.mjs` | TBD（scaffold後に有効化） | — | 実装中 |
| REV-001 | レビュー記録 | `docs/review-policy.md`, `reviews/` | — | — | 実装中 |
| DOC-001 | トレーサビリティ | 本台帳, `.github/` テンプレート | — | — | 実装中 |

**運用:** 状態は 未着手 / 実装中 / レビュー中 / 合格 / 差戻し / 保留 とする。仕様IDを追加したら本台帳にも行を追加する。
