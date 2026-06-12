'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { StaffUserRow } from '../models/user';
import { formatDDMMYYYY } from '../utils/formatters';

interface UserTableProps {
  users: StaffUserRow[];
  deletingIds: Set<string>;
  onConfirmDelete: (user: StaffUserRow) => void;
  hasMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
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

export default memo(function UserTable({
  users,
  deletingIds,
  onConfirmDelete,
  hasMore,
  remainingCount,
  onLoadMore,
}: UserTableProps) {
  const loadMoreLabel = `Load more ${remainingCount} ${remainingCount === 1 ? 'item' : 'items'}`;

  return (
    <div>
      <div className="shopTableWrap">
        <table className="shopTable">
          <thead>
            <tr>
              <th className="colImage">Avatar</th>
              <th>Name</th>
              <th>Username</th>
              <th className="colCreated">Create date</th>
              <th className="colBuy">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="shopEmpty">
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

      {hasMore && (
        <div className="loadMoreWrap">
          <button type="button" className="secondaryButton loadMoreButton" onClick={onLoadMore}>
            {loadMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
});
