import { Card } from "@/components/ui/card";

export default function TasksLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-44 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-md bg-muted" />
          <div className="h-10 w-20 rounded-md bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 border-border">
            <div className="flex justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 max-w-md w-[55%] rounded bg-muted" />
                <div className="h-4 w-full max-w-sm rounded bg-muted" />
                <div className="flex gap-3 mt-3">
                  <div className="h-6 w-28 rounded-md bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-6 w-16 rounded-full bg-muted" />
                <div className="h-8 w-[140px] rounded-md bg-muted" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
