'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plan, PlanChecklistItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface PlanListProps {
  initialPlans: Plan[];
}

export function PlanList({ initialPlans }: PlanListProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: true,
    contract_body_html: '',
    email_subject_template: '',
    email_body_template: '',
    survey_due_months: 2,
  });
  const [checklistItems, setChecklistItems] = useState<PlanChecklistItem[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      status: true,
      contract_body_html: '',
      email_subject_template: '【契約同意】{{plan_name}}（{{customer_name}} 様）',
      email_body_template: `{{group_name}} 様

下記内容を確認のうえ、同意します。

■ 同意内容
私は、{{plan_name}}に関するキャンペーン条件を理解し、同意します。

■ お客様情報
氏名：{{customer_name}}
メール：{{customer_email}}
電話：{{customer_phone}}
契約開始日：{{contract_start_date}}

■ キャンペーン条件
アンケート回答期限：{{survey_due_date}}

■ 契約識別情報
生成日時：{{generated_at}}
契約識別コード：{{contract_fingerprint}}

以上`,
      survey_due_months: 2,
    });
    setChecklistItems([
      { id: crypto.randomUUID(), text: 'アンケート回答期限は {{survey_due_date}} であることを理解しました' },
      { id: crypto.randomUUID(), text: '期限を過ぎるとキャッシュバック対象外になることを理解しました' },
    ]);
    setEditingPlan(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      status: plan.status,
      contract_body_html: plan.contract_body_html,
      email_subject_template: plan.email_subject_template,
      email_body_template: plan.email_body_template,
      survey_due_months: plan.survey_due_months,
    });
    setChecklistItems(plan.checklist_items || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      checklist_items: checklistItems,
    };

    try {
      if (editingPlan) {
        const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (!res.ok) throw new Error('更新に失敗しました');

        const updated = await res.json();
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? updated : p))
        );
        toast.success('プランを更新しました');
      } else {
        const res = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (!res.ok) throw new Error('作成に失敗しました');

        const created = await res.json();
        setPlans((prev) => [...prev, created]);
        toast.success('プランを作成しました');
      }

      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error(editingPlan ? '更新に失敗しました' : '作成に失敗しました');
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`「${plan.name}」を削除しますか？`)) return;

    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('削除に失敗しました');

      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      toast.success('プランを削除しました');
      router.refresh();
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">プラン管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="text-base">
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingPlan ? 'プラン編集' : '新規プラン作成'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">プラン名</Label>
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
                <Label className="text-base">スラッグ（URLに使用）</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="text-base"
                  placeholder="plan-a"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">アンケート期限（開始日から何ヶ月後）</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.survey_due_months}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      survey_due_months: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">契約条件（HTML）</Label>
                <Textarea
                  value={formData.contract_body_html}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contract_body_html: e.target.value,
                    }))
                  }
                  className="text-base min-h-[120px] font-mono text-sm"
                  placeholder="<h3>キャンペーン条件</h3>..."
                  required
                />
                <p className="text-sm text-muted-foreground">
                  利用可能な変数: {'{{survey_due_date}}'}, {'{{customer_name}}'}, {'{{plan_name}}'}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base">確認事項チェックリスト</Label>
                <p className="text-sm text-muted-foreground">
                  顧客が同意前に確認する項目（すべてチェック必須）
                </p>
                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground mt-2.5 w-6">{index + 1}.</span>
                      <Input
                        value={item.text}
                        onChange={(e) => {
                          const newItems = [...checklistItems];
                          newItems[index] = { ...item, text: e.target.value };
                          setChecklistItems(newItems);
                        }}
                        className="flex-1 text-sm"
                        placeholder="確認事項を入力..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setChecklistItems(checklistItems.filter((_, i) => i !== index));
                        }}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setChecklistItems([
                      ...checklistItems,
                      { id: crypto.randomUUID(), text: '' },
                    ]);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  確認事項を追加
                </Button>
                <p className="text-sm text-muted-foreground">
                  利用可能な変数: {'{{survey_due_date}}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base">メール件名テンプレート</Label>
                <Input
                  value={formData.email_subject_template}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email_subject_template: e.target.value,
                    }))
                  }
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">メール本文テンプレート</Label>
                <Textarea
                  value={formData.email_body_template}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email_body_template: e.target.value,
                    }))
                  }
                  className="text-base min-h-[200px] font-mono text-sm"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  利用可能な変数: {'{{group_name}}'}, {'{{plan_name}}'}, {'{{customer_name}}'}, {'{{customer_email}}'}, {'{{customer_phone}}'}, {'{{contract_start_date}}'}, {'{{survey_due_date}}'}, {'{{generated_at}}'}, {'{{contract_fingerprint}}'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="plan-status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, status: !!checked }))
                  }
                />
                <Label htmlFor="plan-status" className="text-base">
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
                  {editingPlan ? '更新' : '作成'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">プラン名</TableHead>
                <TableHead className="text-base">スラッグ</TableHead>
                <TableHead className="text-base">期限</TableHead>
                <TableHead className="text-base">確認項目</TableHead>
                <TableHead className="text-base">ステータス</TableHead>
                <TableHead className="text-base text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-base text-muted-foreground py-8">
                    プランがありません
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="text-base font-medium">{plan.name}</TableCell>
                    <TableCell className="text-base">{plan.slug}</TableCell>
                    <TableCell className="text-base">{plan.survey_due_months}ヶ月後</TableCell>
                    <TableCell className="text-base">{plan.checklist_items?.length || 0}件</TableCell>
                    <TableCell className="text-base">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          plan.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {plan.status ? '有効' : '無効'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                          className="text-sm"
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan)}
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
