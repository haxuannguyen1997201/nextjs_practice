'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ProductDetailPage error]', error)
  }, [error])

  const router = useRouter()

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Failed to load product</h1>
          <div className="shopHeaderActions">
            <button type="button" className="secondaryButton" onClick={() => router.push('/')}>
              Back
            </button>
          </div>
        </div>
      </div>
      <div className="errorPageBody">
        <p className="shopStatus shopStatusError">
          {error.message || 'An unexpected error occurred while loading this product.'}
        </p>
        <button className="primaryButton" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  )
}
