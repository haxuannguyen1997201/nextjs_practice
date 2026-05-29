'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ShopProduct } from '../models/product';
import { formatDDMMYYYY, formatGBP } from '../utils/formatters';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}

interface ProductRowProps {
  product: ShopProduct;
  deletingIds: Set<string>;
  onConfirmDelete: (product: ShopProduct) => void;
}

interface ProductTableProps {
  sortedProducts: ShopProduct[];
  deletingIds: Set<string>;
  onConfirmDelete: (product: ShopProduct) => void;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  hasMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
}

function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  sortDir,
  onSort,
  className,
}: SortableHeaderProps) {
  let icon = ' ↕';
  if (currentSortKey === sortKey) {
    icon = sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  return (
    <th className={className}>
      <button type="button" className="sortableHeader" onClick={() => onSort(sortKey)}>
        {label}
        {icon}
      </button>
    </th>
  );
}

function ProductRow({ product, deletingIds, onConfirmDelete }: ProductRowProps) {
  const router = useRouter();
  const id = String(product.id ?? '');
  const isDeleting = deletingIds.has(id);

  function goToDetail() {
    if (id.length > 0) router.push(`/detail/${encodeURIComponent(id)}`);
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
          {product.image ? (
            <Image
              className="productThumb"
              src={product.image}
              alt={product.name ?? ''}
              width={52}
              height={52}
            />
          ) : (
            <div className="productThumbFallback" aria-hidden="true" />
          )}
        </div>
      </td>
      <td className="productName">{product.name}</td>
      <td className="productSummary">{product.summary}</td>
      <td className="productCreated">{formatDDMMYYYY(product.createdAt)}</td>
      <td className="productPrice">{formatGBP(product.price)}</td>
      <td className="productBuy">
        <button
          type="button"
          className="deleteProduct"
          onClick={(e) => {
            e.stopPropagation();
            onConfirmDelete(product);
          }}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

export default memo(function ProductTable({
  sortedProducts,
  deletingIds,
  onConfirmDelete,
  sortKey,
  sortDir,
  onSort,
  hasMore,
  remainingCount,
  onLoadMore,
}: ProductTableProps) {
  const loadMoreLabel = `Load more ${remainingCount} ${remainingCount === 1 ? 'item' : 'items'}`;

  return (
    <div>
      <div className="shopTableWrap">
        <table className="shopTable">
          <thead>
            <tr>
              <th className="colImage">Image</th>
              <SortableHeader
                label="Name"
                sortKey="name"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="colSummary">Summary</th>
              <SortableHeader
                label="Created"
                sortKey="createdAt"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
                className="colCreated"
              />
              <SortableHeader
                label="Price"
                sortKey="price"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
                className="colPrice"
              />
              <th className="colBuy">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="shopEmpty">
                  No products match your filters.
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => (
                <ProductRow
                  key={String(product.id)}
                  product={product}
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
