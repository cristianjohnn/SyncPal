import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
      <div className="rounded-2xl bg-muted h-40" />
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-36 rounded-md bg-muted" />
        <div className="h-10 w-32 rounded-md bg-muted" />
        <div className="h-10 w-40 rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-28 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="h-5 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-7 w-40 rounded bg-muted" />
        <Card>
          <CardContent className="p-0">
            <div className="h-[400px] bg-muted/40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
