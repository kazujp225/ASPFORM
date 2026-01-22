import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getPlans, createPlan } from '@/lib/db';

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await getPlans();
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      status,
      contract_body_html,
      checklist_items,
      email_subject_template,
      email_body_template,
      survey_due_months,
    } = body;

    if (!name || !slug || !contract_body_html || !email_subject_template || !email_body_template) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      );
    }

    const plan = await createPlan({
      name,
      slug,
      status: status ?? true,
      contract_body_html,
      checklist_items: checklist_items || [],
      email_subject_template,
      email_body_template,
      survey_due_months: survey_due_months || 2,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '作成に失敗しました' },
      { status: 500 }
    );
  }
}
