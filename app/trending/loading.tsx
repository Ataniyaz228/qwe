import { Skeleton } from "@/components/ui/skeleton"

export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-background pt-14 md:pl-16 lg:pl-56">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />

        <Skeleton className="h-20 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-8 w-64 mb-6" />

        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
