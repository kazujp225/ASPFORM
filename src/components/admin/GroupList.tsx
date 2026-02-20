'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface GroupListProps {
  initialGroups: Group[];
}

export function GroupList({ initialGroups }: GroupListProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    type: 'group' as 'person' | 'group',
    name: '',
    email: '',
    status: true,
    allowed_domains: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'group',
      name: '',
      email: '',
      status: true,
      allowed_domains: '',
    });
    setEditingGroup(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      type: group.type,
      name: group.name,
      email: group.email,
      status: group.status,
      allowed_domains: group.allowed_domains.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      allowed_domains: formData.allowed_domains
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d),
    };

    try {
      if (editingGroup) {
        const res = await fetch(`/api/admin/groups/${editingGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('更新に失敗しました');

        const updated = await res.json();
        setGroups((prev) =>
          prev.map((g) => (g.id === editingGroup.id ? updated : g))
        );
        toast.success('グループを更新しました');
      } else {
        const res = await fetch('/api/admin/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('作成に失敗しました');

        const created = await res.json();
        setGroups((prev) => [...prev, created]);
        toast.success('グループを作成しました');
      }

      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error(editingGroup ? '更新に失敗しました' : '作成に失敗しました');
    }
  };

  const handleDelete = async (group: Group) => {
    if (!confirm(`「${group.name}」を削除しますか？`)) return;

    try {
      const res = await fetch(`/api/admin/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('削除に失敗しました');

      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      toast.success('グループを削除しました');
      router.refresh();
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  const copyUrl = (group: Group) => {
    const url = `${window.location.origin}/p/plan-a?u=${group.token}`;
    navigator.clipboard.writeText(url);
    toast.success('URLをコピーしました');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">グループ管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="text-base">
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingGroup ? 'グループ編集' : '新規グループ作成'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">タイプ</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'person' | 'group') =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group" className="text-base">グループ</SelectItem>
                    <SelectItem value="person" className="text-base">個人</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base">名前</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">メールアドレス</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">許可ドメイン（カンマ区切り）</Label>
                <Input
                  value={formData.allowed_domains}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowed_domains: e.target.value,
                    }))
                  }
                  className="text-base"
                  placeholder="example.jp, example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, status: !!checked }))
                  }
                />
                <Label htmlFor="status" className="text-base">
                  有効
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 text-base"
                >
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1 text-base">
                  {editingGroup ? '更新' : '作成'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">名前</TableHead>
                <TableHead className="text-base">タイプ</TableHead>
                <TableHead className="text-base">メール</TableHead>
                <TableHead className="text-base">ステータス</TableHead>
                <TableHead className="text-base text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-base text-muted-foreground py-8">
                    グループがありません
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="text-base font-medium">{group.name}</TableCell>
                    <TableCell className="text-base">
                      {group.type === 'group' ? 'グループ' : '個人'}
                    </TableCell>
                    <TableCell className="text-base">{group.email}</TableCell>
                    <TableCell className="text-base">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          group.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {group.status ? '有効' : '無効'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyUrl(group)}
                          className="text-sm"
                        >
                          URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(group)}
                          className="text-sm"
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(group)}
                          className="text-sm text-destructive hover:text-destructive"
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
