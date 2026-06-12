'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logoutAction } from '@/src/app/actions/auth';
import { useDeleteUserMutation, useGetStaffUsersQuery } from '@/src/store/productsApi';
import UserTable from '@/src/component/UserTable';
import type { StaffUserRow } from '@/src/models/user';
import { useAuthUser } from '@/src/hooks/useAuthUser';
import { useUserSearch } from '@/src/hooks/useUserSearch';
import { useDeleteConfirmation } from '@/src/hooks/useDeleteConfirmation';
import { useToastNotification } from '@/src/hooks/useToastNotification';
import { clearUser } from '@/src/store/authSlice';
import { persistor } from '@/src/store/store';
import type { AppDispatch } from '@/src/store/store';

export default function UserPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: rawData = [], isLoading, isError } = useGetStaffUsersQuery(undefined);
  const [deleteUser, { error: deleteError }] = useDeleteUserMutation();

  const { user: currentUser, label: userLabel } = useAuthUser();
  const { toastNotice, showToast } = useToastNotification();
  const { search, visibleUsers, hasMore, remainingCount, onSearchChange, onLoadMore } =
    useUserSearch(rawData as StaffUserRow[]);
  const { pendingDelete, deletingIds, onConfirmDelete, onDeleteConfirmed, onDeleteCanceled } =
    useDeleteConfirmation<StaffUserRow>(async (user) => {
      const id = String(user.id ?? '');
      const name = String(user.name ?? user.username ?? '').trim();
      try {
        await deleteUser(id).unwrap();
        showToast({ kind: 'success', message: name ? `Deleted "${name}".` : 'User deleted.' });
      } catch {
        showToast({
          kind: 'error',
          message: name ? `Failed to delete "${name}".` : 'Failed to delete user.',
        });
      }
    });

  useEffect(() => {
    if (currentUser === null) {
      router.replace('/login');
      return;
    }
    if (String(currentUser.role ?? '').trim().toLowerCase() !== 'admin') {
      router.replace('/');
    }
  }, [currentUser, router]);

  async function handleLogout() {
    dispatch(clearUser());
    await persistor.flush();
    await logoutAction();
  }

  return (
    <div className="shopPage">
      <div className="shopHeader">
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
            onChange={(e) => onSearchChange(e.target.value)}
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
          hasMore={hasMore}
          remainingCount={remainingCount}
          onLoadMore={onLoadMore}
        />
      )}

      {pendingDelete && (
        <div className="confirmToast" role="alertdialog" aria-modal="false" aria-live="assertive">
          <p className="confirmToastText">
            Delete {pendingDelete.name ? `"${pendingDelete.name}"` : 'this user'}?
          </p>
          <div className="confirmToastActions">
            <button type="button" className="secondaryButton" onClick={onDeleteCanceled}>
              Cancel
            </button>
            <button type="button" className="deleteProduct" onClick={onDeleteConfirmed}>
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
