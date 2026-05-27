import { notFound } from 'next/navigation'
import ProductDetailScreen from '../../../src/component/ProductDetailScreen'

interface ApiProduct {
  id?: string | number
  productName?: string
  image?: string
  summary?: string
  price?: number | string
  color?: string
  createdAt?: string
}

// Returns null when product is not found (404), throws on network/server errors
async function getProduct(productId: string): Promise<ApiProduct | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl || !productId) return null

  const response = await fetch(`${baseUrl}/products/${encodeURIComponent(productId)}`, {
    cache: 'no-store',
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Failed to load product (${response.status})`)

  return (await response.json()) as ApiProduct
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params
  const productId = String(resolvedParams?.productId ?? '')
  const initialProduct = await getProduct(productId)

  if (initialProduct === null) notFound()

  return <ProductDetailScreen productId={productId} initialProduct={initialProduct} />
}
