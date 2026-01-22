import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getGroups, getPlans, getSubmissions } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, FileText, Settings, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const [groups, plans, submissions] = await Promise.all([
    getGroups(),
    getPlans(),
    getSubmissions(),
  ]);

  const activeGroups = groups.filter(g => g.status);
  const activePlans = plans.filter(p => p.status);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ダッシュボード</h1>
        <p className="text-lg text-slate-600">
          システムの利用状況を確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/groups" className="block group">
          <Card className="hover:border-slate-400 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-slate-600">グループ管理</CardTitle>
              <Users className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{groups.length}</div>
              <p className="text-base text-slate-500 mt-1">
                有効: {activeGroups.length}件
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/plans" className="block group">
          <Card className="hover:border-slate-400 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-slate-600">プラン設定</CardTitle>
              <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{plans.length}</div>
              <p className="text-base text-slate-500 mt-1">
                有効: {activePlans.length}件
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/submissions" className="block group">
          <Card className="hover:border-slate-400 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-slate-600">同意履歴</CardTitle>
              <FileText className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{submissions.length}</div>
              <p className="text-base text-slate-500 mt-1">
                累計件数
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">最近の同意履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-base text-slate-500 py-6 text-center">同意履歴はまだありません</p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-900">{sub.customer_name}</p>
                      <p className="text-sm text-slate-500">{sub.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 tabular-nums">
                    {new Date(sub.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Link href="/admin/submissions" className="text-base text-slate-700 hover:underline inline-flex items-center">
                  すべての履歴を見る <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
