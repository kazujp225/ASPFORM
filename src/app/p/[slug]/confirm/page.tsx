'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, ChevronLeft, Check, User, Mail, Phone, Calendar, Clock, FileText } from 'lucide-react';

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  contract_start_date: string;
  token: string;
  slug: string;
}

interface PlanData {
  name: string;
  slug: string;
  contract_body_html: string;
  survey_due_months: number;
}

interface GroupData {
  name: string;
}

interface PageData {
  plan: PlanData;
  group: GroupData;
}

function calculateSurveyDueDate(startDate: string, months: number): string {
  const date = addMonths(new Date(startDate), months);
  return format(date, 'yyyy年M月d日', { locale: ja });
}

function formatContractDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy年M月d日', { locale: ja });
}

function renderContractHtml(html: string, data: {
  survey_due_date: string;
  customer_name: string;
  plan_name: string;
}): string {
  let result = html;
  result = result.replace(/\{\{survey_due_date\}\}/g, data.survey_due_date);
  result = result.replace(/\{\{customer_name\}\}/g, data.customer_name);
  result = result.replace(/\{\{plan_name\}\}/g, data.plan_name);
  return result;
}

export default function ConfirmPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = searchParams.get('u');

  const [formData, setFormData] = useState<FormData | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/error?code=MISSING_TOKEN');
      return;
    }

    const storedData = sessionStorage.getItem('customerFormData');
    if (!storedData) {
      router.push(`/p/${slug}?u=${encodeURIComponent(token)}`);
      return;
    }

    const parsed = JSON.parse(storedData) as FormData;
    if (parsed.token !== token || parsed.slug !== slug) {
      router.push(`/p/${slug}?u=${encodeURIComponent(token)}`);
      return;
    }

    setFormData(parsed);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/p/${slug}?u=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          router.push(`/error?code=${data.error || 'INVALID_REQUEST'}`);
          return;
        }

        setPageData(data);
      } catch {
        router.push('/error?code=INVALID_REQUEST');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token, router]);

  const surveyDueDate = useMemo(() => {
    if (!formData || !pageData) return '';
    return calculateSurveyDueDate(formData.contract_start_date, pageData.plan.survey_due_months);
  }, [formData, pageData]);

  const renderedContractHtml = useMemo(() => {
    if (!formData || !pageData) return '';
    return renderContractHtml(pageData.plan.contract_body_html, {
      survey_due_date: surveyDueDate,
      customer_name: formData.customer_name,
      plan_name: pageData.plan.name,
    });
  }, [formData, pageData, surveyDueDate]);

  const handleBack = () => {
    router.push(`/p/${slug}?u=${encodeURIComponent(token || '')}`);
  };

  const handleNext = () => {
    router.push(`/p/${slug}/checkpoint?u=${encodeURIComponent(token || '')}`);
  };

  if (loading || !formData || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-slate-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">{pageData.group.name}</Badge>
              <h1 className="text-xl font-bold text-slate-900">{pageData.plan.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white">
                <Check className="w-4 h-4" />
              </span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-medium">2</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">3</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 入力内容カード */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              入力内容の確認
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <dl className="space-y-4">
              <div className="flex items-center gap-4">
                <dt className="w-32 text-sm text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> お名前
                </dt>
                <dd className="flex-1 font-medium">{formData.customer_name}</dd>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <dt className="w-32 text-sm text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> メール
                </dt>
                <dd className="flex-1 break-all">{formData.customer_email}</dd>
              </div>
              {formData.customer_phone && (
                <>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <dt className="w-32 text-sm text-slate-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> 電話番号
                    </dt>
                    <dd className="flex-1">{formData.customer_phone}</dd>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center gap-4">
                <dt className="w-32 text-sm text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 契約開始日
                </dt>
                <dd className="flex-1">{formatContractDate(formData.contract_start_date)}</dd>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <dt className="w-32 text-sm text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 回答期限
                </dt>
                <dd className="flex-1">
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    {surveyDueDate}
                  </Badge>
                </dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mt-4 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              修正する
            </Button>
          </CardContent>
        </Card>

        {/* 契約条件カード */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              契約条件
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-4">
              以下の契約条件をよくお読みください。次の画面で重要事項の確認を行います。
            </p>
            <div
              className="prose prose-slate max-w-none prose-headings:text-lg prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3 first:prose-headings:mt-0 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-red-600 prose-ul:my-4 prose-li:text-slate-700"
              dangerouslySetInnerHTML={{ __html: renderedContractHtml }}
            />
          </CardContent>
        </Card>

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-1 h-14"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            戻る
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-lg"
          >
            確認事項へ進む
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
