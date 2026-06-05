'use client';

import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { logoutAction } from '@/src/app/actions/auth';
import Toolbar from '@/src/component/Toolbar';
import type { ApiProduct, ShopProduct } from '@/src/models/product';
import { useDeleteProductMutation, useGetProductsQuery } from '@/src/store/productsApi';
import ProductTable from '@/src/component/ProductTable';
import FilterView from '@/src/component/FilterView';
import { useAuthUser } from '@/src/hooks/useAuthUser';
import { useProductSearch } from '@/src/hooks/useProductSearch';
import { useDeleteConfirmation } from '@/src/hooks/useDeleteConfirmation';
import { useToastNotification } from '@/src/hooks/useToastNotification';
import { clearUser } from '@/src/store/authSlice';
import { persistor } from '@/src/store/store';
import type { AppDispatch } from '@/src/store/store';


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
  const dispatch = useDispatch<AppDispatch>();
  const { data: rawData = [], isLoading, isError } = useGetProductsQuery(undefined);
  const [deleteProduct, { error: deleteError }] = useDeleteProductMutation();

  const { label: userLabel } = useAuthUser();
  const { toastNotice, showToast } = useToastNotification();

  const products = useMemo(() => (rawData as ApiProduct[]).map(toShopProduct), [rawData]);

  const {
    search,
    selectedColors,
    sortKey,
    sortDir,
    colorOptions,
    visibleProducts,
    hasMore,
    remainingCount,
    onSearchChange,
    onToggleColor,
    onReset,
    onSort,
    onLoadMore,
  } = useProductSearch(products);

  const { pendingDelete, deletingIds, onConfirmDelete, onDeleteConfirmed, onDeleteCanceled } =
    useDeleteConfirmation<ShopProduct>(async (product) => {
      const id = String(product.id ?? '');
      const name = String(product.name ?? '').trim();
      try {
        await deleteProduct(id).unwrap();
        showToast({
          kind: 'success',
          message: name.length > 0 ? `Deleted "${name}".` : 'Product deleted.',
        });
      } catch {
        showToast({
          kind: 'error',
          message: name.length > 0 ? `Failed to delete "${name}".` : 'Failed to delete product.',
        });
      }
    });

  async function handleLogout() {
    dispatch(clearUser());
    await persistor.flush();
    await logoutAction();
  }

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Product Dashboard</h1>
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
          <Toolbar search={search} onSearchChange={onSearchChange} onReset={onReset} />

          {isError && <p className="shopStatus shopStatusError">Failed to load products.</p>}
          {deleteError && <p className="shopStatus shopStatusError">Failed to delete product.</p>}

          {isLoading ? (
            <p className="shopStatus">Loading products...</p>
          ) : (
            <ProductTable
              sortedProducts={visibleProducts}
              deletingIds={deletingIds}
              onConfirmDelete={onConfirmDelete}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              hasMore={hasMore}
              remainingCount={remainingCount}
              onLoadMore={onLoadMore}
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
