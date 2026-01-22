# CLAUDE.md - ASPFORM 開発ガイド

## プロジェクト概要

契約確認・同意メール生成システム（ASPFORM）
営業が顧客へURLを送付 → 顧客が条件確認・同意 → mailtoでメール作成

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS + lucide-react
- **Form**: react-hook-form + zod
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript

## プロジェクト構造

```
/
├── CLAUDE.md              # このファイル
├── plan.md                # プロジェクト概要
├── docs/                  # 詳細仕様書
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # リダイレクト
│   │   ├── admin/
│   │   │   ├── layout.tsx     # 管理画面レイアウト
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx       # ダッシュボード
│   │   │   ├── groups/
│   │   │   ├── plans/
│   │   │   └── submissions/
│   │   ├── p/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # 入力画面
│   │   │       ├── confirm/page.tsx
│   │   │       └── complete/page.tsx
│   │   ├── error/page.tsx
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── groups/
│   │       │   ├── plans/
│   │       │   └── submissions/
│   │       └── p/
│   │           └── [slug]/
│   ├── components/
│   │   ├── ui/              # shadcn/ui
│   │   ├── admin/           # 管理画面専用
│   │   └── customer/        # 顧客画面専用
│   ├── lib/
│   │   ├── db.ts            # DB接続（モック/Supabase切替）
│   │   ├── auth.ts          # 認証
│   │   ├── token.ts         # トークン生成・検証
│   │   ├── template.ts      # テンプレート展開
│   │   └── mailto.ts        # mailto生成
│   ├── types/
│   │   └── index.ts
│   └── mock/
│       └── data.ts          # モックデータ
├── public/
└── .env.local
```

## コマンド

```bash
# 開発
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck

# Lint
npm run lint

# テスト
npm run test
```

## 環境変数

```env
# .env.local

# 認証
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
SESSION_SECRET=your-32-char-random-string

# データベース（本番用）
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# モック/本番切替
USE_MOCK=true

# ドメイン制限
ALLOWED_DOMAINS=raise.jp,nextfrontier.jp

# アプリURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 開発フェーズ

### Phase 1: モック実装（現在）

`USE_MOCK=true` でダミーデータを使用。DB接続なしで動作確認可能。

### Phase 2: DB接続

`USE_MOCK=false` でSupabase接続。

### Phase 3: 本番デプロイ

Vercelにデプロイ。環境変数を本番用に設定。

---

## モックデータ仕様

### src/mock/data.ts

```typescript
export const mockGroups: Group[] = [
  {
    id: '1',
    type: 'group',
    name: 'RAISEチーム',
    email: 'raise@example.jp',
    token: 'mock-token-raise-001',
    status: true,
    allowed_domains: ['example.jp'],
    last_used_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'group',
    name: 'NextFrontierチーム',
    email: 'nf@example.jp',
    token: 'mock-token-nf-002',
    status: true,
    allowed_domains: ['example.jp'],
    last_used_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'プランA（2ヶ月後アンケート）',
    slug: 'plan-a',
    status: true,
    contract_body_html: `
      <h3>キャンペーン条件</h3>
      <p>アンケートは <strong>{{survey_due_date}}</strong> までにご回答ください。</p>
      <p>期限までにご回答がない場合、キャッシュバック対象外となります。</p>
    `,
    email_subject_template: '【契約同意】{{plan_name}}（{{customer_name}} 様）',
    email_body_template: `{{group_name}} 様

下記内容を確認のうえ、同意します。

■ 同意内容
私は、{{plan_name}}に関するキャンペーン条件を理解し、同意します。

■ お客様情報
氏名：{{customer_name}}
メール：{{customer_email}}
電話：{{customer_phone}}
契約開始日：{{contract_start_date}}

■ キャンペーン条件
アンケート回答期限：{{survey_due_date}}

■ 契約識別情報
生成日時：{{generated_at}}
契約識別コード：{{contract_fingerprint}}

以上`,
    survey_due_months: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'プランB（1ヶ月後アンケート）',
    slug: 'plan-b',
    status: true,
    contract_body_html: `
      <h3>キャンペーン条件</h3>
      <p>アンケートは <strong>{{survey_due_date}}</strong> までにご回答ください。</p>
    `,
    email_subject_template: '【契約同意】{{plan_name}}（{{customer_name}} 様）',
    email_body_template: `同意メール本文...`,
    survey_due_months: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockSubmissions: Submission[] = [];
```

---

## DB抽象化レイヤー

### src/lib/db.ts

```typescript
import { mockGroups, mockPlans, mockSubmissions } from '@/mock/data';

const useMock = process.env.USE_MOCK === 'true';

// Groups
export async function getGroups(): Promise<Group[]> {
  if (useMock) return mockGroups;
  // Supabase実装
  const { data } = await supabase.from('groups').select('*');
  return data || [];
}

export async function getGroupByToken(token: string): Promise<Group | null> {
  if (useMock) {
    return mockGroups.find(g => g.token === token) || null;
  }
  // Supabase実装
  const { data } = await supabase
    .from('groups')
    .select('*')
    .eq('token', token)
    .single();
  return data;
}

export async function createGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
  if (useMock) {
    const newGroup = {
      ...group,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockGroups.push(newGroup);
    return newGroup;
  }
  // Supabase実装
}

// Plans
export async function getPlans(): Promise<Plan[]> {
  if (useMock) return mockPlans;
  // Supabase実装
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  if (useMock) {
    return mockPlans.find(p => p.slug === slug) || null;
  }
  // Supabase実装
}

// Submissions
export async function createSubmission(data: SubmissionInput): Promise<Submission> {
  if (useMock) {
    const submission = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockSubmissions.push(submission);
    return submission;
  }
  // Supabase実装
}

export async function getSubmissions(): Promise<Submission[]> {
  if (useMock) return mockSubmissions;
  // Supabase実装
}
```

---

## 型定義

### src/types/index.ts

```typescript
export interface Group {
  id: string;
  type: 'person' | 'group';
  name: string;
  email: string;
  token: string;
  status: boolean;
  allowed_domains: string[];
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  contract_body_html: string;
  email_subject_template: string;
  email_body_template: string;
  survey_due_months: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  plan_id: string;
  group_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  contract_start_date: string;
  computed_dates: {
    survey_due_date: string;
  };
  rendered_contract_body: string;
  rendered_email_subject: string;
  rendered_email_body: string;
  contract_fingerprint: string;
  user_agent: string | null;
  created_at: string;
}

export interface CustomerInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  contract_start_date: string;
  agree_checked: boolean;
}
```

---

## ユーティリティ関数

### src/lib/token.ts

```typescript
import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function isTokenExpired(lastUsedAt: string | null, days: number = 90): boolean {
  if (!lastUsedAt) return false;
  const expireDate = new Date(lastUsedAt);
  expireDate.setDate(expireDate.getDate() + days);
  return new Date() > expireDate;
}
```

### src/lib/template.ts

```typescript
import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TemplateData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  contract_start_date: string;
  survey_due_date: string;
  plan_name: string;
  group_name: string;
  contract_fingerprint: string;
  generated_at: string;
}

export function renderTemplate(template: string, data: TemplateData): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

export function calculateSurveyDueDate(startDate: string, months: number): string {
  const date = addMonths(new Date(startDate), months);
  return format(date, 'yyyy年M月d日', { locale: ja });
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy年M月d日 HH:mm', { locale: ja });
}
```

### src/lib/mailto.ts

```typescript
interface MailtoParams {
  to: string;
  subject: string;
  body: string;
}

export function generateMailtoUrl({ to, subject, body }: MailtoParams): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);
  return `mailto:${to}?${params.toString()}`;
}
```

### src/lib/fingerprint.ts

```typescript
import crypto from 'crypto';

interface FingerprintData {
  planId: string;
  contractBody: string;
  customerData: object;
  contractStartDate: string;
  groupEmail: string;
  generatedAt: string;
}

export function generateFingerprint(data: FingerprintData): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex').substring(0, 16);
}
```

---

## API実装例

### src/app/api/p/[slug]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPlanBySlug, getGroupByToken } from '@/lib/db';
import { isTokenExpired } from '@/lib/token';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const token = request.nextUrl.searchParams.get('u');

  if (!token) {
    return NextResponse.json({ error: 'MISSING_TOKEN' }, { status: 400 });
  }

  const [plan, group] = await Promise.all([
    getPlanBySlug(params.slug),
    getGroupByToken(token),
  ]);

  if (!plan || !plan.status) {
    return NextResponse.json({ error: 'PLAN_INACTIVE' }, { status: 400 });
  }

  if (!group || !group.status) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 });
  }

  if (isTokenExpired(group.last_used_at)) {
    return NextResponse.json({ error: 'TOKEN_EXPIRED' }, { status: 400 });
  }

  return NextResponse.json({
    plan: {
      name: plan.name,
      slug: plan.slug,
      contract_body_html: plan.contract_body_html,
      survey_due_months: plan.survey_due_months,
    },
    group: {
      name: group.name,
    },
  });
}
```

### src/app/api/p/[slug]/submit/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPlanBySlug, getGroupByToken, createSubmission } from '@/lib/db';
import { renderTemplate, calculateSurveyDueDate, formatDate } from '@/lib/template';
import { generateMailtoUrl } from '@/lib/mailto';
import { generateFingerprint } from '@/lib/fingerprint';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const body = await request.json();
  const { u: token, customer_name, customer_email, customer_phone, contract_start_date, agree_checked } = body;

  // バリデーション
  if (!agree_checked) {
    return NextResponse.json({ error: 'AGREE_REQUIRED' }, { status: 400 });
  }

  const [plan, group] = await Promise.all([
    getPlanBySlug(params.slug),
    getGroupByToken(token),
  ]);

  if (!plan || !group) {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
  }

  const generatedAt = formatDate(new Date());
  const surveyDueDate = calculateSurveyDueDate(contract_start_date, plan.survey_due_months);

  const templateData = {
    customer_name,
    customer_email,
    customer_phone: customer_phone || '',
    contract_start_date: formatDate(new Date(contract_start_date)),
    survey_due_date: surveyDueDate,
    plan_name: plan.name,
    group_name: group.name,
    contract_fingerprint: '', // 後で設定
    generated_at: generatedAt,
  };

  const renderedBody = renderTemplate(plan.contract_body_html, templateData);
  const renderedSubject = renderTemplate(plan.email_subject_template, templateData);

  const fingerprint = generateFingerprint({
    planId: plan.id,
    contractBody: renderedBody,
    customerData: { customer_name, customer_email, customer_phone },
    contractStartDate: contract_start_date,
    groupEmail: group.email,
    generatedAt,
  });

  templateData.contract_fingerprint = fingerprint;
  const renderedEmailBody = renderTemplate(plan.email_body_template, templateData);

  // 保存
  await createSubmission({
    plan_id: plan.id,
    group_id: group.id,
    customer_name,
    customer_email,
    customer_phone,
    contract_start_date,
    computed_dates: { survey_due_date: surveyDueDate },
    rendered_contract_body: renderedBody,
    rendered_email_subject: renderedSubject,
    rendered_email_body: renderedEmailBody,
    contract_fingerprint: fingerprint,
    user_agent: request.headers.get('user-agent'),
  });

  const mailtoUrl = generateMailtoUrl({
    to: group.email,
    subject: renderedSubject,
    body: renderedEmailBody,
  });

  return NextResponse.json({
    mailto_url: mailtoUrl,
    fallback: {
      to: group.email,
      subject: renderedSubject,
      body: renderedEmailBody,
    },
    fingerprint,
  });
}
```

---

## 実装順序

### Step 1: プロジェクトセットアップ
```bash
npx create-next-app@latest aspform --typescript --tailwind --app
cd aspform
npx shadcn@latest init
npx shadcn@latest add button card input label toast
```

### Step 2: モックデータ・型定義
- `src/types/index.ts`
- `src/mock/data.ts`

### Step 3: ユーティリティ
- `src/lib/db.ts`
- `src/lib/token.ts`
- `src/lib/template.ts`
- `src/lib/mailto.ts`

### Step 4: 顧客画面
- `/p/[slug]` 入力
- `/p/[slug]/confirm` 確認・同意
- `/p/[slug]/complete` 完了

### Step 5: 管理画面
- `/admin/login`
- `/admin` ダッシュボード
- `/admin/groups` グループ管理
- `/admin/plans` プラン管理

### Step 6: Supabase接続
- `USE_MOCK=false` に切替
- DB実装を追加

---

## 注意事項

- **mailto文字数制限**: 本文が長すぎるとスマホで壊れる。要点のみ推奨。
- **過去ログ不変性**: `rendered_*` は必ず保存。プラン編集しても過去は変わらない。
- **トークン失効**: 90日ルールを守る。セキュリティ上重要。
- **ドメイン制限**: 許可ドメイン以外のメールは登録拒否。
