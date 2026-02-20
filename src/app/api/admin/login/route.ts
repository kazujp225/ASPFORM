import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }

    const valid = await validateCredentials(username, password);

    if (!valid) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const sessionId = await createSession();
    await setSessionCookie(sessionId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}
