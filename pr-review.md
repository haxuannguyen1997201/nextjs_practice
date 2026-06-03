## Project Structure

### src Folder

If using `src` folder, move all app routing inside it.
[Reference](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder)

### Route Grouping

Consider grouping related routes together using route groups based on auth role (folders prefixed with `()`).
[Reference](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)

---

## Auth State: Use Redux Instead of localStorage

It is recommended to store user information in a Redux slice rather than in `localStorage`.

**Current problematic code:**

```ts
useEffect(() => {
  if (state?.success) {
    localStorage.setItem('auth_user', JSON.stringify(state.user));
    const role = String((state.user as { role?: string })?.role ?? '')
      .trim()
      .toLowerCase();
    router.push(role === 'admin' ? '/users' : '/');
  }
}, [state, router]);
```

### Example Migration

#### 1. Create an `authSlice`

```ts
// src/store/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id?: string | number;
  name?: string;
  username?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
}

const initialState: AuthState = { user: null };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
```

#### 2. Add the slice to the store

```ts
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { productsApi } from './productsApi';
import { authSlice } from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 3. Dispatch `setUser` after successful login instead of writing to `localStorage`

```tsx
// app/login/page.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginAction, type LoginState } from '@/app/actions/auth';
import { setUser } from '@/src/store/authSlice';
import type { AppDispatch } from '@/src/store/store';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [state, action] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      dispatch(setUser(state.user as AuthUser));
      const role = String((state.user as { role?: string })?.role ?? '')
        .trim()
        .toLowerCase();
      router.push(role === 'admin' ? '/users' : '/');
    }
  }, [state, router, dispatch]);

  // ...
}
```

#### 4. Read user from the Redux store wherever needed

```ts
// src/hooks/useAuthUser.ts
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store/store';

export function useAuthUser() {
  return useSelector((state: RootState) => state.auth.user);
}
```

```tsx
// app/page.tsx (or any client component)
const currentUser = useAuthUser();
const userLabel = currentUser?.name ?? currentUser?.username ?? null;
```

#### 5. Dispatch `clearUser` on logout

```ts
async function handleLogout() {
  await logoutAction();
  dispatch(clearUser());
  router.push('/login');
}
```

### If Still Using localStorage

Consider creating a `useAuthUser` hook to avoid duplicate code.

**Extract to `src/hooks/useAuthUser.ts`:**

```ts
'use client';
import { useSyncExternalStore, useMemo } from 'react';
import type { AuthUser } from '@/src/models/auth';

// ...shared logic...
export function useAuthUser() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const label = useMemo(() => formatLabel(user), [user]);
  return { user, label };
}
```

Use `redux-persist` or a similar library to persist auth state instead of manually syncing with `localStorage`.
[Reference](https://www.npmjs.com/package/redux-persist)

---

## Redundant `process.env` Checking

`NEXT_PUBLIC_*` variables are inlined at build time and are visible on both server and client side.

**Current code in `utils/env.ts`:**

```ts
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  // On client side, process.env might not have NEXT_PUBLIC_API_URL during module evaluation
  // Return it if available, otherwise return empty string (fetchBaseQuery will handle it)
  if (
    typeof window !== 'undefined' &&
    (!value || String(value).trim().length === 0)
  ) {
    return '';
  }

  // On server side, always require it
  if (typeof window === 'undefined') {
    return getRequiredEnv('NEXT_PUBLIC_API_URL');
  }

  return String(value);
}
```

The `typeof window` checks are unnecessary — `NEXT_PUBLIC_*` variables are available in both environments. Simplify accordingly.

---

## Extract Logic into Custom Reusable Hooks

[Reference](https://react.dev/learn/reusing-logic-with-custom-hooks)

### User Page

The `UserPage` component is doing too much. Extract the following custom hooks:

#### 1. `useAuthUser()` — Manages authentication state

```ts
// src/hooks/useAuthUser.ts
'use client';

import { useSyncExternalStore, useMemo } from 'react';
import type { AuthUser } from '@/src/models/auth';

function subscribeAuthUser(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

let cachedAuthUserRaw: string | null | undefined;
let cachedAuthUser: AuthUser | null = null;

function getClientAuthUser(): AuthUser | null {
  const rawValue = localStorage.getItem('auth_user');
  if (rawValue === cachedAuthUserRaw) {
    return cachedAuthUser;
  }
  cachedAuthUserRaw = rawValue;
  try {
    cachedAuthUser = rawValue ? (JSON.parse(rawValue) as AuthUser) : null;
  } catch {
    cachedAuthUser = null;
  }
  return cachedAuthUser;
}

function getServerAuthUser(): AuthUser | null {
  return null;
}

function formatAuthUserLabel(user: AuthUser | null): string | null {
  if (!user) return null;
  const name = String(user.name ?? user.username ?? '').trim();
  if (!name) return null;
  const role = String(user.role ?? '').trim();
  return role ? `${name} (${role})` : name;
}

export function useAuthUser() {
  const user = useSyncExternalStore(
    subscribeAuthUser,
    getClientAuthUser,
    getServerAuthUser,
  );
  const label = useMemo(() => formatAuthUserLabel(user), [user]);
  return { user, label };
}
```

#### 2. `useUserSearch()` — Handles search filtering and pagination

```ts
// src/hooks/useUserSearch.ts
'use client';

import { useState, useMemo, useCallback } from 'react';
import type { StaffUserRow } from '@/src/models/user';

const PAGE_SIZE = 20;

export function useUserSearch(allUsers: StaffUserRow[]) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allUsers;
    return allUsers.filter((user) => {
      const name = String(user.name ?? '').toLowerCase();
      const username = String(user.username ?? '').toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [allUsers, search]);

  const visibleUsers = useMemo(
    () => filteredUsers.slice(0, visibleCount),
    [filteredUsers, visibleCount],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return {
    search,
    visibleUsers,
    filteredUsers,
    hasMore: visibleUsers.length < filteredUsers.length,
    remainingCount: Math.max(filteredUsers.length - visibleUsers.length, 0),
    onSearchChange: handleSearchChange,
    onLoadMore: handleLoadMore,
  };
}
```

#### 3. `useDeleteConfirmation()` — Handles delete confirmation and mutation

```ts
// src/hooks/useDeleteConfirmation.ts
'use client';

import { useCallback, useState } from 'react';
import type { StaffUserRow } from '@/src/models/user';

export function useDeleteConfirmation(onDelete: (id: string) => Promise<void>) {
  const [pendingDelete, setPendingDelete] = useState<StaffUserRow | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());

  const onConfirmDelete = useCallback((user: StaffUserRow) => {
    const id = String(user?.id ?? '');
    if (id.length === 0) return;
    setPendingDelete(user);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!pendingDelete) return;
    const id = String(pendingDelete.id ?? '');
    if (!id) {
      setPendingDelete(null);
      return;
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPendingDelete(null);

    try {
      await onDelete(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingDelete, onDelete]);

  const handleDeleteCanceled = useCallback(() => {
    setPendingDelete(null);
  }, []);

  return {
    pendingDelete,
    deletingIds,
    onConfirmDelete,
    onDeleteConfirmed: handleDeleteConfirmed,
    onDeleteCanceled: handleDeleteCanceled,
  };
}
```

#### 4. `useToastNotification()` — Auto-dismissing toast notifications

```ts
// src/hooks/useToastNotification.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ToastNotice } from '@/src/models/ui';

const TOAST_DURATION_MS = 2600;

export function useToastNotification() {
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => {
      setToastNotice(null);
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  const showToast = useCallback((notice: ToastNotice) => {
    setToastNotice(notice);
  }, []);

  return { toastNotice, showToast };
}
```

#### 5. Refactored `UserPage` Component

```tsx
'use client';

export default function UserPage() {
  const router = useRouter();
  const {
    data: rawData = [],
    isLoading,
    isError,
  } = useGetStaffUsersQuery(undefined);
  const [deleteUser, { error: deleteError }] = useDeleteUserMutation();

  const { user: currentUser, label: userLabel } = useAuthUser();
  const {
    search,
    visibleUsers,
    hasMore,
    remainingCount,
    onSearchChange,
    onLoadMore,
  } = useUserSearch(rawData as StaffUserRow[]);
  const {
    pendingDelete,
    deletingIds,
    onConfirmDelete,
    onDeleteConfirmed,
    onDeleteCanceled,
  } = useDeleteConfirmation(async (id) => {
    await deleteUser(id).unwrap();
    showToast({
      kind: 'success',
      message: `User deleted.`,
    });
  });
  const { toastNotice, showToast } = useToastNotification();

  // Redirect non-admin users
  useEffect(() => {
    if (!currentUser) return;
    if (
      String(currentUser.role ?? '')
        .trim()
        .toLowerCase() !== 'admin'
    ) {
      router.replace('/');
    }
  }, [currentUser, router]);

  async function handleLogout() {
    try {
      await logoutAction();
    } finally {
      localStorage.removeItem('auth_user');
      router.push('/login');
    }
  }

  /** Render component **/
}
```

### Benefits

- Hooks are reusable across other components
- Easier to test (hooks can be tested in isolation)
- Separation of concerns (data, UI, state management)
- Better readability and maintainability

---

## HomePage / ProductPage

Apply the same hook-extraction principle to `HomePage` and `ProductPage` to further improve code organization and maintainability.
