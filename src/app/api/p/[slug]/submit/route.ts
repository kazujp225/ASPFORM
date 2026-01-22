import { NextRequest, NextResponse } from 'next/server';
import { getPlanBySlug, getGroupByToken, createSubmission } from '@/lib/db';
import { renderTemplate, calculateSurveyDueDate, formatDate, formatDateShort } from '@/lib/template';
import { generateMailtoUrl } from '@/lib/mailto';
import { generateFingerprint } from '@/lib/fingerprint';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const {
      u: token,
      customer_name,
      customer_email,
      customer_phone,
      contract_start_date,
      agree_checked,
    } = body;

    if (!agree_checked) {
      return NextResponse.json({ error: 'AGREE_REQUIRED' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'MISSING_TOKEN' }, { status: 400 });
    }

    const [plan, group] = await Promise.all([
      getPlanBySlug(slug),
      getGroupByToken(token),
    ]);

    if (!plan || !group) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    if (!plan.status || !group.status) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    const generatedAt = formatDate(new Date());
    const surveyDueDate = calculateSurveyDueDate(contract_start_date, plan.survey_due_months);
    const formattedContractStartDate = formatDateShort(contract_start_date);

    const templateData = {
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      contract_start_date: formattedContractStartDate,
      survey_due_date: surveyDueDate,
      plan_name: plan.name,
      group_name: group.name,
      contract_fingerprint: '',
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

    await createSubmission({
      plan_id: plan.id,
      group_id: group.id,
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
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
  } catch {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 500 });
  }
}
