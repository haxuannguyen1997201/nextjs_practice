'use client';

import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import type { RootState } from '@/src/store/store';
import type { AuthUser } from '@/src/models/auth';

function formatAuthUserLabel(user: AuthUser | null): string | null {
  if (!user) return null;
  const name = String(user.name ?? user.username ?? '').trim();
  if (!name) return null;
  const role = String(user.role ?? '').trim();
  return role ? `${name} (${role})` : name;
}

export function useAuthUser() {
  const user = useSelector((state: RootState) => state.auth.user);
  const label = useMemo(() => formatAuthUserLabel(user), [user]);
  return { user, label };
}
