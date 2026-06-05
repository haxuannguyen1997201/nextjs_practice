'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken } from '@/lib/session';
import { getApiBaseUrl } from '@/src/utils/env';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

interface UpstreamUser {
  password?: string;
  [key: string]: unknown;
}

export type LoginState =
  | { success: true; user: Record<string, unknown> }
  | { success: false; message: string; fieldErrors?: { username?: string[]; password?: string[] } }
  | null;

async function fetchUsersByUsername(apiBase: string, username: string): Promise<UpstreamUser[]> {
  const resources = ['login', 'users'];
  const queryKeys = ['username', 'userName', 'name', 'email'];

  for (const resource of resources) {
    for (const key of queryKeys) {
      const query = new URLSearchParams({ [key]: username });
      const response = await fetch(`${apiBase}/${resource}?${query.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) continue;
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) return data as UpstreamUser[];
      if (data && typeof data === 'object') return [data as UpstreamUser];
      return [];
    }
  }

  return [];
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const apiBase = getApiBaseUrl();

  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as {
        username?: string[];
        password?: string[];
      },
    };
  }

  const { username, password } = parsed.data;

  let userList: UpstreamUser[] = [];
  try {
    userList = await fetchUsersByUsername(apiBase, username);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reach upstream auth service.';
    console.log(message);
    return { success: false, message };
  }

  if (userList.length === 0) {
    return { success: false, message: 'No user found.' };
  }

  const matched = userList.find((user) => String(user?.password ?? '') === password);
  if (!matched) {
    return { success: false, message: 'Incorrect password.' };
  }

  const safeUser = { ...matched };
  delete safeUser.password;

  const cookieStore = await cookies();
  const role = String(safeUser.role ?? '').trim().toLowerCase();
  const sessionToken = await createSessionToken(role);
  if (!sessionToken) {
    return { success: false, message: 'SESSION_SECRET is not configured.' };
  }

  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  // Remove legacy cookies after migrating to signed session cookie.
  cookieStore.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  cookieStore.set('auth_role', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return { success: true, user: safeUser as Record<string, unknown> };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('auth_token');
  cookieStore.delete('auth_role');
  redirect('/login');
}
