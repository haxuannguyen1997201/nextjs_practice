'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import Toolbar from '@/src/component/Toolbar';
import { ShopProduct } from '@/src/types.js';
import { useDeleteProductMutation, useGetProductsQuery } from '@/src/store/productsApi.js';
import ProductTable from '@/src/component/ProductTable';
import FilterView from '@/src/component/FilterView';

interface ApiProduct {
  id?: string | number;
  productName?: string;
  image?: string;
  summary?: string;
  price?: number | string;
  color?: string;
  createdAt?: string;
}

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

function toShopProduct(apiProduct: ApiProduct): ShopProduct {
  return {
    id: apiProduct?.id,
    name: apiProduct?.productName,
    image: apiProduct?.image,
    summary: apiProduct?.summary,
    price: apiProduct.price,
    color: apiProduct?.color,
    createdAt: apiProduct?.createdAt,
  };
}

export default function ProductPage() {
  const router = useRouter();
  const { data: rawData = [], isLoading, isError } = useGetProductsQuery(undefined);
  const [deleteProduct, { error: deleteError }] = useDeleteProductMutation();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [pendingDelete, setPendingDelete] = useState<ShopProduct | null>(null);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const currentUser = useSyncExternalStore(subscribeAuthUser, getClientAuthUser, getServerAuthUser);
  const userLabel = useMemo(() => formatAuthUserLabel(currentUser), [currentUser]);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => {
      setToastNotice(null);
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  async function handleLogout() {
    try {
      await logoutAction();
    } finally {
      localStorage.removeItem('auth_user');
      router.push('/login');
    }
  }

  const onConfirmDelete = useCallback(async (product: ShopProduct) => {
    const id = String(product?.id ?? '');
    if (id.length === 0) return;
    setPendingDelete(product);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!pendingDelete) return;

    const id = String(pendingDelete?.id ?? '');
    if (id.length === 0) {
      setPendingDelete(null);
      return;
    }

    const name = String(pendingDelete?.name ?? '').trim();

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPendingDelete(null);
    try {
      await deleteProduct(id).unwrap();
      setToastNotice({
        kind: 'success',
        message: name.length > 0 ? `Deleted "${name}".` : 'Product deleted.',
      });
    } catch {
      setToastNotice({
        kind: 'error',
        message: name.length > 0 ? `Failed to delete "${name}".` : 'Failed to delete product.',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [deleteProduct, pendingDelete]);

  const handleDeleteCanceled = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const [search, setSearch] = useState('');
  const [selectedColors, setSelectedColors] = useState<Set<string>>(() => new Set());
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const products = useMemo(() => (rawData as ApiProduct[]).map(toShopProduct), [rawData]);

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

  const onToggleColor = useCallback((color: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }, []);

  const onReset = useCallback(() => {
    setSearch('');
    setSelectedColors(new Set());
  }, []);

  const onSort = useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDir(key === 'createdAt' ? 'desc' : 'asc');
      return key;
    });
  }, []);

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Shop</h1>
          <div className="shopHeaderActions">
            {userLabel && <span className="userLabel">{userLabel}</span>}
            <button type="button" className="logoutLabel" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="shopLayout">
        <main className="shopMain">
          <Toolbar search={search} onSearchChange={setSearch} onReset={onReset} />

          {isError && <p className="shopStatus shopStatusError">Failed to load products.</p>}
          {deleteError && <p className="shopStatus shopStatusError">Failed to delete product.</p>}

          {isLoading ? (
            <p className="shopStatus">Loading products...</p>
          ) : (
            <ProductTable
              sortedProducts={sortedProducts}
              deletingIds={deletingIds}
              onConfirmDelete={onConfirmDelete}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          )}
        </main>

        <FilterView
          colorOptions={colorOptions}
          selectedColors={selectedColors}
          onToggleColor={onToggleColor}
        />
      </div>

      {pendingDelete && (
        <div className="confirmToast" role="alertdialog" aria-modal="false" aria-live="assertive">
          <p className="confirmToastText">
            Delete {pendingDelete.name ? `"${pendingDelete.name}"` : 'this product'}?
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
