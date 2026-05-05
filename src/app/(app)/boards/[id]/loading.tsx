import { Card } from "@/components/ui/card";

export default function BoardDetailLoading() {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-pulse">
      <div className="flex justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-md bg-muted" />
            <div className="h-4 w-80 rounded-md bg-muted" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
      <div className="flex gap-6 overflow-hidden flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="flex-shrink-0 w-[320px] flex flex-col overflow-hidden border-border"
          >
            <div className="h-12 border-b bg-muted/30" />
            <div className="flex-1 p-3 space-y-3 bg-muted/10">
              <div className="h-24 rounded-lg bg-muted/60" />
              <div className="h-24 rounded-lg bg-muted/60" />
              <div className="h-16 rounded-lg bg-muted/40" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
