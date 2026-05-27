'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ProductPage error]', error)
  }, [error])

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Something went wrong</h1>
        </div>
      </div>
      <div className="errorPageBody">
        <p className="shopStatus shopStatusError">
          {error.message || 'An unexpected error occurred while loading products.'}
        </p>
        <button className="primaryButton" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  )
}
