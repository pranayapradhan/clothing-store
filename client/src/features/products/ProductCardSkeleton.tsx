export default function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] animate-pulse rounded-lg bg-gray-200" />

      <div className="space-y-2 pt-4">
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}