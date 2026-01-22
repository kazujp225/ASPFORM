'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronRight, ChevronLeft, Check, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  contract_start_date: string;
  token: string;
  slug: string;
}

interface ChecklistItem {
  id: string;
  text: string;
}

interface PlanData {
  name: string;
  slug: string;
  checklist_items: ChecklistItem[];
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

function renderChecklistText(text: string, surveyDueDate: string): string {
  return text.replace(/\{\{survey_due_date\}\}/g, surveyDueDate);
}

export default function CheckpointPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = searchParams.get('u');

  const [formData, setFormData] = useState<FormData | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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

  const allChecked = useMemo(() => {
    if (!pageData) return false;
    return pageData.plan.checklist_items.every(item => checkedItems.has(item.id));
  }, [pageData, checkedItems]);

  const handleCheckChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleBack = () => {
    router.push(`/p/${slug}/confirm?u=${encodeURIComponent(token || '')}`);
  };

  const handleSubmit = async () => {
    if (!formData || !token || !allChecked) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/p/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          u: token,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          contract_start_date: formData.contract_start_date,
          agree_checked: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        router.push(`/error?code=${data.error || 'INVALID_REQUEST'}`);
        return;
      }

      sessionStorage.setItem('submitResult', JSON.stringify(data));
      sessionStorage.removeItem('customerFormData');

      router.push(`/p/${slug}/complete?u=${encodeURIComponent(token)}`);
    } catch {
      router.push('/error?code=INVALID_REQUEST');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-slate-500">読み込み中...</div>
      </div>
    );
  }

  const checkedCount = checkedItems.size;
  const totalCount = pageData.plan.checklist_items.length;

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
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white">
                <Check className="w-4 h-4" />
              </span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-medium">3</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 説明 */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-slate-600" />
              重要事項の確認
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              以下の重要事項を確認し、すべてのチェックボックスにチェックを入れてください。
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={allChecked ? 'default' : 'secondary'} className="text-base px-3 py-1">
                {checkedCount} / {totalCount} 確認済み
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* チェックリスト */}
        <div className="space-y-4">
          {pageData.plan.checklist_items.map((item, index) => {
            const isChecked = checkedItems.has(item.id);
            const renderedText = renderChecklistText(item.text, surveyDueDate);

            return (
              <Card
                key={item.id}
                className={`shadow-md transition-all cursor-pointer ${isChecked
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
                onClick={() => handleCheckChange(item.id, !isChecked)}
              >
                <CardContent className="py-5">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                      className="mt-1 h-6 w-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          確認事項 {index + 1}
                        </Badge>
                      </div>
                      <p className="text-slate-900 leading-relaxed">
                        {renderedText}
                      </p>
                    </div>
                    {isChecked && (
                      <Check className="w-6 h-6 text-emerald-600 shrink-0" />
                    )}
                  </label>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 警告 */}
        {!allChecked && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              すべての確認事項にチェックを入れてください（残り {totalCount - checkedCount} 項目）
            </AlertDescription>
          </Alert>
        )}

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={submitting}
            className="flex-1 h-14"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            戻る
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || !allChecked}
            className={`flex-1 h-14 text-lg font-bold shadow-lg transition-all ${allChecked
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600'
              : 'bg-slate-300'
              }`}
          >
            {submitting ? '処理中...' : '同意して次へ'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
