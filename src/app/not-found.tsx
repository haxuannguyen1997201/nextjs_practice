import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">404 — Page not found</h1>
        </div>
      </div>
      <div className="errorPageBody">
        <p className="shopStatus">The page or product you are looking for does not exist.</p>
        <Link href="/" className="primaryButton">
          Back to products
        </Link>
      </div>
    </div>
  );
}
