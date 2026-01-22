import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getGroups } from '@/lib/db';
import { GroupList } from '@/components/admin/GroupList';

export default async function GroupsPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const groups = await getGroups();

  return <GroupList initialGroups={groups} />;
}
