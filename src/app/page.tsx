import { Suspense } from "react";

import { Tracker } from "@/components/Tracker/Tracker";
import { TrackerSkeleton } from "@/components/Tracker/TrackerSkeleton";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <Suspense fallback={<TrackerSkeleton />}>
        <Tracker />
      </Suspense>
    </main>
  );
}
