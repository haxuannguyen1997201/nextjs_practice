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

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const onLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return {
    search,
    visibleUsers,
    filteredUsers,
    hasMore: visibleUsers.length < filteredUsers.length,
    remainingCount: Math.max(filteredUsers.length - visibleUsers.length, 0),
    onSearchChange,
    onLoadMore,
  };
}
