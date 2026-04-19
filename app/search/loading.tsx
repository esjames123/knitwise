export default function Loading() {
  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      {/* Nav placeholder */}
      <div style={{ backgroundColor: '#1e1c1a', borderBottom: '1px solid #3a3530', height: '65px' }} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Search bar placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-xl"
               style={{ backgroundColor: '#38342f' }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar placeholder — desktop only */}
          <div className="hidden lg:block rounded-2xl p-5"
               style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>
            {[80, 60, 70, 55, 65].map((w, i) => (
              <div key={i} className="mb-4">
                <div className="mb-2 h-4 animate-pulse rounded"
                     style={{ backgroundColor: '#38342f', width: `${w}%` }} />
                {[50, 65, 45, 70].map((w2, j) => (
                  <div key={j} className="mb-2 h-3 animate-pulse rounded"
                       style={{ backgroundColor: '#2e2b28', width: `${w2}%`, border: '1px solid #3a3530' }} />
                ))}
              </div>
            ))}
          </div>

          {/* Results column */}
          <div>
            {/* Mobile filter bar placeholder */}
            <div className="mb-3 flex gap-2 lg:hidden">
              <div className="h-11 flex-1 animate-pulse rounded-xl" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
              <div className="h-11 w-32 animate-pulse rounded-xl" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
            </div>

            {/* Results header */}
            <div className="mb-4 flex items-baseline justify-between">
              <div className="h-7 w-48 animate-pulse rounded-lg" style={{ backgroundColor: '#38342f' }} />
              <div className="h-4 w-24 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
            </div>

            {/* Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden"
                     style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>
                  <div className="animate-pulse" style={{ height: 180, backgroundColor: '#38342f' }} />
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
      </div>
    </div>
  )
}
