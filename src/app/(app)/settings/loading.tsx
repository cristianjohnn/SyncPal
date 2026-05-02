import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-40 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2 pt-2">
              <div className="h-9 w-28 rounded-md bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 rounded-md bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
            <div className="h-10 rounded-md bg-muted md:col-span-2" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between h-10 rounded-md bg-muted/80" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-24 rounded-md border bg-muted/20" />
        </CardContent>
      </Card>
    </div>
  );
}
