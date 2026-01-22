# ASPFORM - 契約確認・同意メール生成システム

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [01-overview.md](docs/01-overview.md) | システム概要・技術スタック・スコープ |
| [02-flow.md](docs/02-flow.md) | ユーザーフロー・エラーハンドリング |
| [03-data-model.md](docs/03-data-model.md) | DBスキーマ・API仕様・テンプレート変数 |
| [04-security.md](docs/04-security.md) | 認証・トークン・バリデーション |
| [05-ui-spec.md](docs/05-ui-spec.md) | 画面仕様・ワイヤーフレーム |
| [06-design-system.md](docs/06-design-system.md) | カラー・タイポ・コンポーネント |

---

## クイックスタート

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck
```

---

## システム概要

**目的**: 営業が電話中に顧客へURLを送付 → 顧客が同意メールを作成

**特徴**:
- システムからメール送信しない（mailto方式）
- 複数ドメイン（RAISE/NextFrontier等）を1システムで管理
- 過去ログの不変性を担保

---

## 主要な設計決定

| 項目 | 決定 |
|------|------|
| 認証 | 固定ID/PW |
| 宛先管理 | グループ単位＋トークン |
| メール | mailto（システム送信なし） |
| 証跡 | rendered_*をDB保存 |

---

## 技術スタック

- **Frontend**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

---

## MVP合格基準

- [ ] 営業が1分以内にURLコピー→送付
- [ ] 顧客が迷わずメール作成到達
- [ ] 同意ログがDB確認可能
- [ ] 月額1,500円以内
