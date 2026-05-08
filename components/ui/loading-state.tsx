export function LoadingState() {
  return (
    <div className="space-y-3" aria-label="Loading">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl border border-border bg-surface" />
      ))}
    </div>
  );
}
