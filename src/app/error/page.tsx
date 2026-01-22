'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_TOKEN: 'URLにトークンが含まれていません。正しいURLからアクセスしてください。',
  INVALID_TOKEN: 'トークンが無効です。URLを確認してください。',
  TOKEN_EXPIRED: 'トークンの有効期限が切れています。担当者にお問い合わせください。',
  PLAN_INACTIVE: 'このプランは現在無効です。担当者にお問い合わせください。',
  INVALID_REQUEST: 'リクエストが無効です。もう一度お試しください。',
  AGREE_REQUIRED: '同意チェックが必要です。',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') || 'UNKNOWN';
  const errorMessage = ERROR_MESSAGES[errorCode] || 'エラーが発生しました。もう一度お試しください。';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">エラー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">{errorMessage}</p>
          <p className="text-sm text-muted-foreground mt-4">
            エラーコード: {errorCode}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
