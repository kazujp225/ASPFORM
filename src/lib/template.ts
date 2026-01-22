import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TemplateData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  contract_start_date: string;
  survey_due_date: string;
  plan_name: string;
  group_name: string;
  contract_fingerprint: string;
  generated_at: string;
}

export function renderTemplate(template: string, data: TemplateData): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

export function calculateSurveyDueDate(startDate: string, months: number): string {
  const date = addMonths(new Date(startDate), months);
  return format(date, 'yyyy年M月d日', { locale: ja });
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy年M月d日 HH:mm', { locale: ja });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy年M月d日', { locale: ja });
}
