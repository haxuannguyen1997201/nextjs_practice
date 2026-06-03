import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store/store';
import type { AuthUser } from '@/src/models/auth';

function formatAuthUserLabel(user: AuthUser | null): string | null {
  if (!user) return null;
  const name = String(user.name ?? user.username ?? '').trim();
  if (!name) return null;
  const role = String(user.role ?? '').trim();
  return role ? `${name} (${role})` : name;
}

function readFromLocalStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const persisted = localStorage.getItem('persist:root');
    if (!persisted) return null;
    const data = JSON.parse(persisted);
    if (!data.auth) return null;
    const authState = JSON.parse(data.auth);
    return authState.user || null;
  } catch {
    return null;
  }
}

export function useAuthUser() {
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  
  // Use useMemo to compute the user once, avoiding unnecessary re-renders
  const user = useMemo(() => {
    if (reduxUser) return reduxUser;
    return readFromLocalStorage();
  }, [reduxUser]);

  const label = useMemo(() => (user ? formatAuthUserLabel(user) : null), [user]);
  return { user, label };
}
