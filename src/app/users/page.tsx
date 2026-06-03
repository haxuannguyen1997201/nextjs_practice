'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logoutAction } from '@/src/app/actions/auth';
import { clearUser } from '@/src/store/authSlice';
import { useAuthUser } from '@/src/hooks/useAuthUser';
import { useDeleteUserMutation, useGetStaffUsersQuery } from '@/src/store/productsApi';
import UserTable from '@/src/component/UserTable';
import type { ToastNotice } from '@/src/models/ui';
import type { StaffUserRow } from '@/src/models/user';
import type { AppDispatch } from '@/src/store/store';

const PAGE_SIZE = 20;

export default function UserPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: rawData = [], isLoading, isError } = useGetStaffUsersQuery(undefined);
  const [deleteUser, { error: deleteError }] = useDeleteUserMutation();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [pendingDelete, setPendingDelete] = useState<StaffUserRow | null>(null);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const { user: currentUser, label: userLabel } = useAuthUser();

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

  const visibleUsers = useMemo(
    () => filteredUsers.slice(0, visibleCount),
    [filteredUsers, visibleCount]
  );

  const hasMoreUsers = visibleUsers.length < filteredUsers.length;
  const remainingUsersCount = Math.max(filteredUsers.length - visibleUsers.length, 0);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => {
      setToastNotice(null);
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  useEffect(() => {
    if (!currentUser) return;
    if (String(currentUser.role ?? '').trim().toLowerCase() !== 'admin') {
      router.replace('/');
    }
  }, [currentUser, router]);

  async function handleLogout() {
    try {
      await logoutAction();
    } finally {
      dispatch(clearUser());
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleLoadMoreUsers = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return (
    <div className="shopPage">
      <div className="shopHeader">``
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Staff Dashboard</h1>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search users..."
          />
        </label>
        <Link href="/add-staff" className="primaryButton shopAddButton">
          Add staff
        </Link>
      </div>

      {isError && <p className="shopStatus shopStatusError">Failed to load users.</p>}
      {deleteError && <p className="shopStatus shopStatusError">Failed to delete user.</p>}

      {isLoading ? (
        <p className="shopStatus">Loading users...</p>
      ) : (
        <UserTable
          users={visibleUsers}
          deletingIds={deletingIds}
          onConfirmDelete={onConfirmDelete}
          hasMore={hasMoreUsers}
          remainingCount={remainingUsersCount}
          onLoadMore={handleLoadMoreUsers}
        />
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
