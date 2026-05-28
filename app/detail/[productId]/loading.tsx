export default function Loading() {
  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <div className="skeletonTitle" />
          <div className="skeletonButton" />
        </div>
      </div>
      <div className="addProductLayout">
        <main className="addProductMain">
          <div className="formCard">
            <div className="skeletonForm">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeletonField" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
