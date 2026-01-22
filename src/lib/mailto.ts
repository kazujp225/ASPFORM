interface MailtoParams {
  to: string;
  subject: string;
  body: string;
}

export function generateMailtoUrl({ to, subject, body }: MailtoParams): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);
  return `mailto:${to}?${params.toString()}`;
}
