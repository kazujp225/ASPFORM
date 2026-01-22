'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, User, Mail, Phone, Calendar } from 'lucide-react';

const customerSchema = z.object({
  customer_name: z.string().min(1, '入力してください'),
  customer_email: z.string().email('正しいメールアドレスを入力してください'),
  customer_phone: z.string().optional(),
  contract_start_date: z.string().min(1, '入力してください'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

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

export default function CustomerInputPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = searchParams.get('u');

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      contract_start_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedData = sessionStorage.getItem('customerFormData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.slug === slug && parsed.token === token) {
          form.reset({
            customer_name: parsed.customer_name || '',
            customer_email: parsed.customer_email || '',
            customer_phone: parsed.customer_phone || '',
            contract_start_date: parsed.contract_start_date || new Date().toISOString().split('T')[0],
          });
        }
      } catch {
        // ignore
      }
    }
  }, [slug, token, form]);

  useEffect(() => {
    if (!token) {
      router.push('/error?code=MISSING_TOKEN');
      return;
    }

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
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token, router]);

  const onSubmit = (data: CustomerFormData) => {
    if (!token) return;

    sessionStorage.setItem('customerFormData', JSON.stringify({
      ...data,
      token,
      slug,
    }));

    router.push(`/p/${slug}/confirm?u=${encodeURIComponent(token)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-slate-500">読み込み中...</div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-red-600">{error || 'エラーが発生しました'}</p>
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
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-medium">1</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">2</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">3</span>
              <ChevronRight className="w-4 h-4" />
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-400">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">お客様情報の入力</CardTitle>
            <CardDescription className="text-base">
              キャンペーン適用に必要な情報を入力してください
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        お名前 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12 text-lg"
                          placeholder="山田 太郎"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        メールアドレス <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="h-12 text-lg"
                          placeholder="example@email.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        電話番号 <span className="text-slate-400 text-sm font-normal">（任意）</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          className="h-12 text-lg"
                          placeholder="090-0000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contract_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        契約開始日 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-lg"
                >
                  次へ進む
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-sm mt-6">
          次の画面で契約条件をご確認いただきます
        </p>
      </main>
    </div>
  );
}
