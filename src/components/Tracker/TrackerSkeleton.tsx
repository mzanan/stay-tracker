import { Skeleton } from "@/components/ui/skeleton";

export function TrackerSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your trips">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-32 rounded-3xl" />
    </div>
  );
}
