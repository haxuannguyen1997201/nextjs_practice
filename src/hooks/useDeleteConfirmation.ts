'use client';

import { useCallback, useState } from 'react';

export function useDeleteConfirmation<T extends { id?: string | number }>(
  onDelete: (item: T) => Promise<void>,
) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());

  const onConfirmDelete = useCallback((item: T) => {
    const id = String(item?.id ?? '');
    if (id.length === 0) return;
    setPendingDelete(item);
  }, []);

  const onDeleteConfirmed = useCallback(async () => {
    if (!pendingDelete) return;
    const id = String(pendingDelete.id ?? '');
    if (!id) {
      setPendingDelete(null);
      return;
    }

    const item = pendingDelete;
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPendingDelete(null);

    try {
      await onDelete(item);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingDelete, onDelete]);

  const onDeleteCanceled = useCallback(() => {
    setPendingDelete(null);
  }, []);

  return {
    pendingDelete,
    deletingIds,
    onConfirmDelete,
    onDeleteConfirmed,
    onDeleteCanceled,
  };
}
