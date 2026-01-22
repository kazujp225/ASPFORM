import { Group, Plan, Submission } from '@/types';

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
    name: 'キャッシュバックキャンペーン プランA',
    slug: 'plan-a',
    status: true,
    contract_body_html: `
      <h3>キャッシュバックキャンペーン条件</h3>
      <p><strong>{{customer_name}}</strong> 様が「{{plan_name}}」にお申し込みいただくにあたり、以下の条件をご確認ください。</p>

      <h3>1. キャッシュバック金額</h3>
      <p>ご契約から2ヶ月後のアンケートにご回答いただくことで、<strong>10,000円</strong>のキャッシュバックを受けられます。</p>

      <h3>2. アンケート回答期限</h3>
      <p>アンケートは <strong>{{survey_due_date}}</strong> までにご回答ください。</p>
      <p>期限を過ぎた場合、キャッシュバックの対象外となりますのでご注意ください。</p>

      <h3>3. 対象条件</h3>
      <ul>
        <li>契約開始日から2ヶ月間、継続してサービスをご利用いただくこと</li>
        <li>期間中に解約・プラン変更がないこと</li>
        <li>アンケートの全項目にご回答いただくこと</li>
      </ul>

      <h3>4. 注意事項</h3>
      <p>キャッシュバックは指定口座への振込となります。アンケート回答後、約1ヶ月以内にお振込みいたします。</p>
    `,
    checklist_items: [
      { id: '1', text: 'アンケート回答期限は {{survey_due_date}} であることを理解しました' },
      { id: '2', text: '期限を過ぎるとキャッシュバック対象外になることを理解しました' },
      { id: '3', text: '契約開始日から2ヶ月間、継続利用が必要であることを理解しました' },
      { id: '4', text: '期間中の解約・プラン変更で対象外になることを理解しました' },
    ],
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
    name: 'スタートダッシュキャンペーン プランB',
    slug: 'plan-b',
    status: true,
    contract_body_html: `
      <h3>スタートダッシュキャンペーン条件</h3>
      <p><strong>{{customer_name}}</strong> 様が「{{plan_name}}」にお申し込みいただくにあたり、以下の条件をご確認ください。</p>

      <h3>1. 特典内容</h3>
      <p>ご契約から1ヶ月後のアンケートにご回答いただくことで、<strong>初月利用料無料</strong>の特典を受けられます。</p>

      <h3>2. アンケート回答期限</h3>
      <p>アンケートは <strong>{{survey_due_date}}</strong> までにご回答ください。</p>
      <p>期限を過ぎた場合、特典の対象外となりますのでご注意ください。</p>

      <h3>3. 対象条件</h3>
      <ul>
        <li>新規ご契約のお客様限定</li>
        <li>契約開始日から1ヶ月間、継続してサービスをご利用いただくこと</li>
        <li>アンケートの全項目にご回答いただくこと</li>
      </ul>
    `,
    checklist_items: [
      { id: '1', text: 'アンケート回答期限は {{survey_due_date}} であることを理解しました' },
      { id: '2', text: '期限を過ぎると初月無料特典の対象外になることを理解しました' },
      { id: '3', text: '新規契約のお客様限定であることを理解しました' },
      { id: '4', text: '契約開始日から1ヶ月間、継続利用が必要であることを理解しました' },
    ],
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
    survey_due_months: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockSubmissions: Submission[] = [];
