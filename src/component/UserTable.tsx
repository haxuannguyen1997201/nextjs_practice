'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { StaffUserRow } from '../models/user';

interface UserTableProps {
  users: StaffUserRow[];
  deletingIds: Set<string>;
  onConfirmDelete: (user: StaffUserRow) => void;
}

function formatDDMMYYYY(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function UserRow({
  user,
  deletingIds,
  onConfirmDelete,
}: {
  user: StaffUserRow;
  deletingIds: Set<string>;
  onConfirmDelete: (user: StaffUserRow) => void;
}) {
  const router = useRouter();
  const id = String(user.id ?? '');
  const isDeleting = deletingIds.has(id);

  function goToDetail() {
    if (id.length > 0) router.push(`/user-detail/${encodeURIComponent(id)}`);
  }

  return (
    <tr
      className="shopRowClickable"
      tabIndex={0}
      role="link"
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goToDetail();
      }}
    >
      <td>
        <div className="productThumbWrap">
          {user.avatar ? (
            <Image
              className="productThumb"
              src={user.avatar}
              alt={user.name ?? user.username ?? ''}
              width={52}
              height={52}
            />
          ) : (
            <div className="productThumbFallback" aria-hidden="true" />
          )}
        </div>
      </td>
      <td className="productName">{user.name}</td>
      <td className="productSummary">{user.username}</td>
      <td className="productSummary">{user.password}</td>
      <td className="productCreated">{formatDDMMYYYY(user.createdAt)}</td>
      <td className="productBuy">
        <button
          type="button"
          className="deleteProduct"
          onClick={(e) => {
            e.stopPropagation();
            onConfirmDelete(user);
          }}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

export default memo(function UserTable({ users, deletingIds, onConfirmDelete }: UserTableProps) {
  return (
    <div className="shopTableWrap">
      <table className="shopTable">
        <thead>
          <tr>
            <th className="colImage">Avatar</th>
            <th>Name</th>
            <th>Username</th>
            <th>Password</th>
            <th className="colCreated">Create date</th>
            <th className="colBuy">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="shopEmpty">
                No users match your search.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserRow
                key={String(user.id)}
                user={user}
                deletingIds={deletingIds}
                onConfirmDelete={onConfirmDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});
