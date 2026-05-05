import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-4 w-80 rounded-md bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-4 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-8 rounded bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-4 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-8 rounded bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-4 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-8 rounded bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-8 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
            
            {/* Table rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-8 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-7 w-20 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
