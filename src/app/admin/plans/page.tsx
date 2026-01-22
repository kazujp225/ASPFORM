import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getPlans } from '@/lib/db';
import { PlanList } from '@/components/admin/PlanList';

export default async function PlansPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const plans = await getPlans();

  return <PlanList initialPlans={plans} />;
}
