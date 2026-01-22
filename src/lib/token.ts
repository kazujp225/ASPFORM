import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function isTokenExpired(lastUsedAt: string | null, days: number = 90): boolean {
  if (!lastUsedAt) return false;
  const expireDate = new Date(lastUsedAt);
  expireDate.setDate(expireDate.getDate() + days);
  return new Date() > expireDate;
}
