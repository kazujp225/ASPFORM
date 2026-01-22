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

export interface PlanChecklistItem {
  id: string;
  text: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  contract_body_html: string;
  checklist_items: PlanChecklistItem[];
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

export interface SubmissionInput {
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
}
