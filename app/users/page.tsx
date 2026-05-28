'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { useDeleteUserMutation, useGetStaffUsersQuery } from '@/src/store/productsApi.js';
import UserTable, { type StaffUserRow } from '@/src/component/UserTable';

interface AuthUser {
  id?: string | number;
  name?: string;
  username?: string;
  role?: string;
}

interface ToastNotice {
  kind: 'success' | 'error';
  message: string;
}

const subscribeAuthUser = () => () => {};

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

export default function UserPage() {
  const router = useRouter();
  const { data: rawData = [], isLoading, isError } = useGetStaffUsersQuery(undefined);
  const [deleteUser, { error: deleteError }] = useDeleteUserMutation();
  const [search, setSearch] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [pendingDelete, setPendingDelete] = useState<StaffUserRow | null>(null);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const currentUser = useSyncExternalStore(subscribeAuthUser, getClientAuthUser, getServerAuthUser);
  const userLabel = useMemo(() => formatAuthUserLabel(currentUser), [currentUser]);

  const users = useMemo(() => rawData as StaffUserRow[], [rawData]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const name = String(user.name ?? '').toLowerCase();
      const username = String(user.username ?? '').toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [users, search]);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => {
      setToastNotice(null);
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  useEffect(() => {
    if (!currentUser) return;
    if (String(currentUser.role ?? '').toLowerCase() !== 'admin') {
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

    const name = String(pendingDelete.name ?? pendingDelete.username ?? '').trim();
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPendingDelete(null);

    try {
      await deleteUser(id).unwrap();
      setToastNotice({
        kind: 'success',
        message: name ? `Deleted "${name}".` : 'User deleted.',
      });
    } catch {
      setToastNotice({
        kind: 'error',
        message: name ? `Failed to delete "${name}".` : 'Failed to delete user.',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [deleteUser, pendingDelete]);

  const handleDeleteCanceled = useCallback(() => {
    setPendingDelete(null);
  }, []);

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">UserPage</h1>
          <div className="shopHeaderActions">
            {userLabel && <span className="userLabel">{userLabel}</span>}
            <button type="button" className="logoutLabel" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="shopToolbar">
        <label className="shopSearch">
          <span className="shopSearchLabel">Search:</span>
          <input
            className="shopSearchInput"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
          />
        </label>
      </div>

      {isError && <p className="shopStatus shopStatusError">Failed to load users.</p>}
      {deleteError && <p className="shopStatus shopStatusError">Failed to delete user.</p>}

      {isLoading ? (
        <p className="shopStatus">Loading users...</p>
      ) : (
        <UserTable users={filteredUsers} deletingIds={deletingIds} onConfirmDelete={onConfirmDelete} />
      )}

      {pendingDelete && (
        <div className="confirmToast" role="alertdialog" aria-modal="false" aria-live="assertive">
          <p className="confirmToastText">
            Delete {pendingDelete.name ? `"${pendingDelete.name}"` : 'this user'}?
          </p>
          <div className="confirmToastActions">
            <button type="button" className="secondaryButton" onClick={handleDeleteCanceled}>
              Cancel
            </button>
            <button type="button" className="deleteProduct" onClick={handleDeleteConfirmed}>
              Delete
            </button>
          </div>
        </div>
      )}

      {toastNotice && (
        <div
          className={`appToast ${toastNotice.kind === 'error' ? 'appToastError' : 'appToastSuccess'}`}
          role="status"
          aria-live="polite"
        >
          {toastNotice.message}
        </div>
      )}
    </div>
  );
}
