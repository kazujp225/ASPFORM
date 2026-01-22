import { NextRequest, NextResponse } from 'next/server';
import { getPlanBySlug, getGroupByToken } from '@/lib/db';
import { isTokenExpired } from '@/lib/token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get('u');

  if (!token) {
    return NextResponse.json({ error: 'MISSING_TOKEN' }, { status: 400 });
  }

  const [plan, group] = await Promise.all([
    getPlanBySlug(slug),
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
      checklist_items: plan.checklist_items,
      survey_due_months: plan.survey_due_months,
    },
    group: {
      name: group.name,
    },
  });
}
