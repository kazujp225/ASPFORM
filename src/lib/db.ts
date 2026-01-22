import { mockGroups, mockPlans, mockSubmissions } from '@/mock/data';
import { Group, Plan, Submission, SubmissionInput } from '@/types';

const useMock = process.env.USE_MOCK !== 'false';

// Groups
export async function getGroups(): Promise<Group[]> {
  if (useMock) return mockGroups;
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getGroupById(id: string): Promise<Group | null> {
  if (useMock) {
    return mockGroups.find(g => g.id === id) || null;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getGroupByToken(token: string): Promise<Group | null> {
  if (useMock) {
    return mockGroups.find(g => g.token === token) || null;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function createGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
  if (useMock) {
    const newGroup: Group = {
      ...group,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockGroups.push(newGroup);
    return newGroup;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function updateGroup(id: string, data: Partial<Omit<Group, 'id' | 'created_at'>>): Promise<Group | null> {
  if (useMock) {
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) return null;
    mockGroups[index] = {
      ...mockGroups[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockGroups[index];
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function deleteGroup(id: string): Promise<boolean> {
  if (useMock) {
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) return false;
    mockGroups.splice(index, 1);
    return true;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

// Plans
export async function getPlans(): Promise<Plan[]> {
  if (useMock) return mockPlans;
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getPlanById(id: string): Promise<Plan | null> {
  if (useMock) {
    return mockPlans.find(p => p.id === id) || null;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  if (useMock) {
    return mockPlans.find(p => p.slug === slug) || null;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
  if (useMock) {
    const newPlan: Plan = {
      ...plan,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPlans.push(newPlan);
    return newPlan;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function updatePlan(id: string, data: Partial<Omit<Plan, 'id' | 'created_at'>>): Promise<Plan | null> {
  if (useMock) {
    const index = mockPlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockPlans[index] = {
      ...mockPlans[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockPlans[index];
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function deletePlan(id: string): Promise<boolean> {
  if (useMock) {
    const index = mockPlans.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockPlans.splice(index, 1);
    return true;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

// Submissions
export async function createSubmission(data: SubmissionInput): Promise<Submission> {
  if (useMock) {
    const submission: Submission = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockSubmissions.push(submission);
    return submission;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getSubmissions(): Promise<Submission[]> {
  if (useMock) return mockSubmissions;
  // Supabase実装
  throw new Error('Supabase not implemented');
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  if (useMock) {
    return mockSubmissions.find(s => s.id === id) || null;
  }
  // Supabase実装
  throw new Error('Supabase not implemented');
}
