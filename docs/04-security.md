# セキュリティ設計

## 1. 認証

### 管理画面
- **方式**: 固定ID/パスワード
- **保存**: 環境変数（`.env`）
- **セッション**: HTTPOnly Cookie

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=random-32-char-string
```

### 追加対策（推奨）
- [ ] IP制限（可能なら）
- [ ] BasicAuth重ね掛け
- [ ] アクセスログ保存

## 2. トークン設計

### 発行ルール
```typescript
// トークン生成（推測困難な32文字）
function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}
```

### 失効ルール
- **条件**: 最終利用から90日経過
- **判定**: `last_used_at + 90days < now()`
- **復旧**: 管理画面から再発行（旧トークン即無効）

### トークン検証フロー
```typescript
async function validateToken(token: string): Promise<Group | null> {
  const group = await db.groups.findByToken(token);

  if (!group) return null;
  if (!group.status) return null;
  if (isExpired(group.last_used_at, 90)) return null;

  // 利用記録更新
  await db.groups.updateLastUsed(group.id);

  return group;
}
```

## 3. ドメイン制限

### 許可ドメイン設定
```env
ALLOWED_DOMAINS=raise.jp,nextfrontier.jp,example-asp.com
```

### 検証
```typescript
function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1];
  const allowed = process.env.ALLOWED_DOMAINS?.split(',') || [];
  return allowed.includes(domain);
}
```

### グループ作成時
- 宛先メールが許可ドメインに一致しない → 保存拒否
- エラー: 「許可されていないドメインです。」

## 4. データ保護

### 保存するデータ
| データ | 目的 | 保存期間 |
|--------|------|----------|
| 顧客情報 | 同意証跡 | 1年 |
| rendered_* | 改ざん防止 | 1年 |
| 識別コード | 照合用 | 1年 |

### 削除ポリシー
```sql
-- 1年経過したsubmissionsを削除
DELETE FROM submissions
WHERE created_at < NOW() - INTERVAL '1 year';
```

### 顧客への表示
```
入力いただいた情報は同意内容の記録および対応のために保管します。
```

## 5. 入力バリデーション

### 顧客入力

| フィールド | ルール |
|------------|--------|
| customer_name | 必須、1-100文字 |
| customer_email | 必須、メール形式 |
| customer_phone | 任意、電話形式 |
| contract_start_date | 必須、当日以降 |
| agree_checked | 必須、true |

### XSS対策
```typescript
// HTMLエスケープ
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## 6. ログ

### アクセスログ（管理画面）
```typescript
interface AdminLog {
  timestamp: Date;
  action: 'login' | 'create' | 'update' | 'delete';
  target: string;
  ip: string;
  userAgent: string;
}
```

### 操作ログ（submissions）
- 全てのsubmit時に自動記録
- user_agent保存（端末判定用）
