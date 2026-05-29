import { notFound } from 'next/navigation';
import ProductDetailScreen from '../../../src/component/ProductDetailScreen';
import type { ApiProduct } from '@/src/models/product';
import { getApiBaseUrl } from '@/src/utils/env';

// Returns null when product is not found (404), throws on network/server errors
async function getProduct(productId: string): Promise<ApiProduct | null> {
  const baseUrl = getApiBaseUrl();
  if (!productId) return null;

  const response = await fetch(`${baseUrl}/products/${encodeURIComponent(productId)}`, {
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to load product (${response.status})`);

  return (await response.json()) as ApiProduct;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  const productId = String(resolvedParams?.productId ?? '');
  const initialProduct = await getProduct(productId);

  if (initialProduct === null) notFound();

  return <ProductDetailScreen productId={productId} initialProduct={initialProduct} />;
}
