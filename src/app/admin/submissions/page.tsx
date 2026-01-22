import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getSubmissions, getPlans, getGroups } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function SubmissionsPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const [submissions, plans, groups] = await Promise.all([
    getSubmissions(),
    getPlans(),
    getGroups(),
  ]);

  const plansMap = new Map(plans.map((p) => [p.id, p]));
  const groupsMap = new Map(groups.map((g) => [g.id, g]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">同意履歴</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">日時</TableHead>
                <TableHead className="text-base">顧客名</TableHead>
                <TableHead className="text-base">メール</TableHead>
                <TableHead className="text-base">プラン</TableHead>
                <TableHead className="text-base">グループ</TableHead>
                <TableHead className="text-base">契約開始日</TableHead>
                <TableHead className="text-base">識別コード</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-base text-slate-500 py-8">
                    同意履歴はまだありません
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => {
                  const plan = plansMap.get(sub.plan_id);
                  const group = groupsMap.get(sub.group_id);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="text-base">
                        {new Date(sub.created_at).toLocaleString('ja-JP')}
                      </TableCell>
                      <TableCell className="text-base font-medium">
                        {sub.customer_name}
                      </TableCell>
                      <TableCell className="text-base">{sub.customer_email}</TableCell>
                      <TableCell className="text-base">{plan?.name || '-'}</TableCell>
                      <TableCell className="text-base">{group?.name || '-'}</TableCell>
                      <TableCell className="text-base">{sub.contract_start_date}</TableCell>
                      <TableCell className="text-base font-mono text-sm">
                        {sub.contract_fingerprint}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
