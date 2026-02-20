'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Check, Mail, Copy, CheckCircle2, ChevronDown } from 'lucide-react';

interface SubmitResult {
  mailto_url: string;
  fallback: {
    to: string;
    subject: string;
    body: string;
  };
  fingerprint: string;
}

export default function CompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = searchParams.get('u');

  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const result = useMemo<SubmitResult | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedResult = sessionStorage.getItem('submitResult');
    if (!storedResult) return null;
    return JSON.parse(storedResult);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/error?code=MISSING_TOKEN');
      return;
    }

    if (!result) {
      router.push(`/p/${slug}?u=${encodeURIComponent(token)}`);
    }
  }, [slug, token, router, result]);

  const handleOpenMail = () => {
    if (result?.mailto_url) {
      window.location.href = result.mailto_url;
    }
  };

  const handleCopy = async () => {
    if (result?.fallback.body) {
      await navigator.clipboard.writeText(result.fallback.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-1 bg-emerald-100 text-emerald-700">同意完了</Badge>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">メールを送信してください</h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white">
                <Check className="w-3.5 h-3.5" />
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white">
                <Check className="w-3.5 h-3.5" />
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white">
                <Check className="w-3.5 h-3.5" />
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-medium">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 成功メッセージ */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600 mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">あと少しで完了です</h2>
          <p className="text-slate-600 leading-relaxed">
            同意内容を記載したメールを送信して手続き完了となります。<br />
            下のボタンを押すとメールアプリが開きます。
          </p>
        </div>

        {/* メール送信カード */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              メールを送信
            </CardTitle>
            <CardDescription>
              ボタンを押すとメールアプリが起動します。内容を確認してそのまま送信してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={handleOpenMail}
              className="w-full h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Mail className="w-6 h-6 mr-3" />
              メールアプリを開く
            </Button>
            <p className="text-center text-slate-400 text-sm mt-4">
              識別コード: <code className="bg-slate-100 px-2 py-1 rounded">{result.fingerprint}</code>
            </p>
          </CardContent>
        </Card>

        {/* フォールバック */}
        <Collapsible open={showFallback} onOpenChange={setShowFallback}>
          <Card className="border-slate-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="text-slate-600">メールアプリが開かない場合</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showFallback ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator />
              <CardContent className="pt-6 space-y-6">
                <p className="text-sm text-slate-600">
                  以下の内容をコピーしてメールを作成してください。
                </p>

                <div>
                  <label className="text-sm font-medium text-slate-700">宛先</label>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <code className="text-sm">{result.fallback.to}</code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">件名</label>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <code className="text-sm">{result.fallback.subject}</code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">本文</label>
                  <Textarea
                    value={result.fallback.body}
                    readOnly
                    className="mt-2 min-h-[200px] font-mono text-sm bg-slate-50"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full h-12"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-600" />
                      コピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      本文をコピー
                    </>
                  )}
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>
    </div>
  );
}
