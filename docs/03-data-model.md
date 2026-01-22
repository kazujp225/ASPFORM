# データモデル・API仕様

## 1. ER図

```
┌─────────────┐       ┌─────────────┐
│   groups    │       │    plans    │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ name        │       │ name        │
│ email       │       │ slug        │
│ token       │       │ body_html   │
│ status      │       │ email_tpl   │
│ last_used   │       │ due_months  │
└──────┬──────┘       └──────┬──────┘
       │                     │
       └──────────┬──────────┘
                  │
          ┌──────┴──────┐
          │ submissions │
          ├─────────────┤
          │ id          │
          │ group_id    │
          │ plan_id     │
          │ customer_*  │
          │ rendered_*  │
          │ fingerprint │
          └─────────────┘
```

## 2. テーブル定義

### groups（担当者/グループ）

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) DEFAULT 'group' CHECK (type IN ('person', 'group')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status BOOLEAN DEFAULT true,
  allowed_domains TEXT[],
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_token ON groups(token);
CREATE INDEX idx_groups_name ON groups(name);
```

### plans（プラン）

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status BOOLEAN DEFAULT true,
  contract_body_html TEXT NOT NULL,
  email_subject_template TEXT NOT NULL,
  email_body_template TEXT NOT NULL,
  survey_due_months INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON plans(slug);
```

### submissions（送信ログ）

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id),
  group_id UUID REFERENCES groups(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  contract_start_date DATE NOT NULL,
  computed_dates JSONB,
  rendered_contract_body TEXT NOT NULL,
  rendered_email_subject TEXT NOT NULL,
  rendered_email_body TEXT NOT NULL,
  contract_fingerprint TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_created ON submissions(created_at DESC);
CREATE INDEX idx_submissions_group ON submissions(group_id);
```

## 3. API仕様

### 公開API（顧客向け）

#### GET `/api/p/[slug]`
プラン情報取得

```typescript
// Request
GET /api/p/plan-a?u=K8h2Qx9...

// Response 200
{
  "plan": {
    "name": "プランA（2ヶ月後アンケート）",
    "slug": "plan-a",
    "contract_body_html": "..."
  },
  "group": {
    "name": "RAISEチーム"
  }
}

// Response 400
{ "error": "INVALID_TOKEN" }
{ "error": "PLAN_INACTIVE" }
```

#### POST `/api/p/[slug]/submit`
同意送信

```typescript
// Request
POST /api/p/plan-a/submit
{
  "u": "K8h2Qx9...",
  "customer_name": "山田太郎",
  "customer_email": "yamada@example.com",
  "customer_phone": "090-1234-5678",
  "contract_start_date": "2026-02-01",
  "agree_checked": true
}

// Response 200
{
  "mailto_url": "mailto:...",
  "fallback": {
    "to": "raise@company.jp",
    "subject": "【契約同意】プランA（山田太郎 様）",
    "body": "..."
  },
  "fingerprint": "a1b2c3d4..."
}
```

### 管理API

#### グループ管理

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/admin/groups` | 一覧取得 |
| GET | `/api/admin/groups/[id]` | 詳細取得 |
| POST | `/api/admin/groups` | 新規作成 |
| PUT | `/api/admin/groups/[id]` | 更新 |
| DELETE | `/api/admin/groups/[id]` | 無効化 |
| POST | `/api/admin/groups/[id]/regenerate` | トークン再発行 |

#### プラン管理

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/admin/plans` | 一覧取得 |
| GET | `/api/admin/plans/[id]` | 詳細取得 |
| POST | `/api/admin/plans` | 新規作成 |
| PUT | `/api/admin/plans/[id]` | 更新 |
| DELETE | `/api/admin/plans/[id]` | 無効化 |

#### 履歴

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/admin/submissions` | 一覧取得 |
| GET | `/api/admin/submissions/[id]` | 詳細取得 |

## 4. テンプレート変数

| 変数 | 説明 |
|------|------|
| `{{customer_name}}` | 顧客氏名 |
| `{{customer_email}}` | 顧客メール |
| `{{customer_phone}}` | 顧客電話 |
| `{{contract_start_date}}` | 契約開始日 |
| `{{survey_due_date}}` | アンケート期限 |
| `{{plan_name}}` | プラン名 |
| `{{contract_fingerprint}}` | 識別コード |
| `{{generated_at}}` | 生成日時 |

日付フォーマット: `YYYY年M月D日`

## 5. 識別コード生成

```typescript
function generateFingerprint(data: {
  planId: string;
  contractBody: string;
  customerData: object;
  contractStartDate: string;
  groupEmail: string;
  generatedAt: string;
}): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex').substring(0, 16);
}
```
