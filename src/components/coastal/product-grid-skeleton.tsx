interface ProductGridSkeletonProps {
  count?: number;
}

/** Coastal Analog loading tiles — no generic pulse cards. */
export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <ul
      className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <div className="aspect-[3/4] bg-[linear-gradient(150deg,#e8e2d8,#ddd4c9_55%,#d5cec4)]" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 bg-oat/70" />
            <div className="h-3 w-1/3 bg-oat/50" />
            <div className="flex gap-1.5 pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-oat" />
              <span className="h-2.5 w-2.5 rounded-full bg-oat/70" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
