import crypto from 'crypto';

interface FingerprintData {
  planId: string;
  contractBody: string;
  customerData: object;
  contractStartDate: string;
  groupEmail: string;
  generatedAt: string;
}

export function generateFingerprint(data: FingerprintData): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex').substring(0, 16);
}
