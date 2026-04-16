export default function Loading() {
  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      {/* Nav placeholder */}
      <div style={{ backgroundColor: '#1e1c1a', borderBottom: '1px solid #3a3530', height: '65px' }} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Search bar placeholder */}
        <div className="mb-10 flex justify-center">
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-xl"
               style={{ backgroundColor: '#38342f' }} />
        </div>

        {/* Results header placeholder */}
        <div className="mb-6 flex items-baseline justify-between">
          <div className="h-7 w-56 animate-pulse rounded-lg" style={{ backgroundColor: '#38342f' }} />
          <div className="h-4 w-32 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}
                 className="rounded-2xl overflow-hidden"
                 style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>
              <div className="h-2 animate-pulse" style={{ backgroundColor: '#C06B45', opacity: 0.3 }} />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
                <div className="h-4 w-1/2 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
                <div className="flex gap-2">
                  <div className="h-5 w-20 animate-pulse rounded-full" style={{ backgroundColor: '#38342f' }} />
                  <div className="h-5 w-16 animate-pulse rounded-full" style={{ backgroundColor: '#38342f' }} />
                </div>
                <div className="h-9 w-full animate-pulse rounded-lg" style={{ backgroundColor: '#38342f' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
