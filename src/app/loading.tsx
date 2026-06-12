export default function Loading() {
  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <div className="skeletonTitle" />
        </div>
      </div>
      <div className="skeletonTable">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeletonRow" />
        ))}
      </div>
    </div>
  );
}
