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

async function getProduct(productId: string): Promise<ApiProduct | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl || !productId) return null

  try {
    const response = await fetch(`${baseUrl}/products/${encodeURIComponent(productId)}`, {
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as ApiProduct
  } catch {
    return null
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params
  const productId = String(resolvedParams?.productId ?? '')
  const initialProduct = await getProduct(productId)

  return <ProductDetailScreen productId={productId} initialProduct={initialProduct} />
}
