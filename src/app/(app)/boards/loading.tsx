import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BoardsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-full sm:w-64 rounded-md bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div className="h-6 w-40 rounded bg-muted" />
                <div className="h-8 w-8 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-full rounded bg-muted mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="h-5 w-16 rounded bg-muted" />
                <div className="h-5 w-14 rounded bg-muted" />
              </div>
              <div className="h-9 w-full rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
