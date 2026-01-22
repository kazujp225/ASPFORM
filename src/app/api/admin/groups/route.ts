import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getGroups, createGroup } from '@/lib/db';
import { generateToken } from '@/lib/token';

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const groups = await getGroups();
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, name, email, status, allowed_domains } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: '名前とメールアドレスは必須です' },
        { status: 400 }
      );
    }

    const group = await createGroup({
      type: type || 'group',
      name,
      email,
      token: generateToken(),
      status: status ?? true,
      allowed_domains: allowed_domains || [],
      last_used_at: null,
    });

    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '作成に失敗しました' },
      { status: 500 }
    );
  }
}
