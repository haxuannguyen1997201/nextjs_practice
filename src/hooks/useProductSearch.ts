'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ShopProduct } from '@/src/models/product';

const PAGE_SIZE = 20;

export function useProductSearch(products: ShopProduct[]) {
  const [search, setSearch] = useState('');
  const [selectedColors, setSelectedColors] = useState<Set<string>>(() => new Set());
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const colorOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const color = product.color ?? '';
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count || a.color.localeCompare(b.color));
  }, [products]);

  const sortedProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const hasColorFilter = selectedColors.size > 0;

    const filtered = products.filter((p) => {
      const matchesSearch = query.length === 0 || (p.name ?? '').toLowerCase().includes(query);
      const matchesColor = !hasColorFilter || selectedColors.has(p.color ?? '');
      return matchesSearch && matchesColor;
    });

    return filtered.sort((a, b) => {
      let aVal: number | string = a[sortKey as keyof ShopProduct] as number | string;
      let bVal: number | string = b[sortKey as keyof ShopProduct] as number | string;
      if (sortKey === 'createdAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortKey === 'price') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, search, selectedColors, sortKey, sortDir]);

  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount],
  );

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const onToggleColor = useCallback((color: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }, []);

  const onReset = useCallback(() => {
    setSearch('');
    setSelectedColors(new Set());
    setVisibleCount(PAGE_SIZE);
  }, []);

  const onSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setVisibleCount(PAGE_SIZE);
        return;
      }
      setSortKey(key);
      setSortDir(key === 'createdAt' ? 'desc' : 'asc');
      setVisibleCount(PAGE_SIZE);
    },
    [sortKey],
  );

  const onLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return {
    search,
    selectedColors,
    sortKey,
    sortDir,
    colorOptions,
    visibleProducts,
    hasMore: visibleProducts.length < sortedProducts.length,
    remainingCount: Math.max(sortedProducts.length - visibleProducts.length, 0),
    onSearchChange,
    onToggleColor,
    onReset,
    onSort,
    onLoadMore,
  };
}
