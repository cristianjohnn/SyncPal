"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto rounded-xl border border-border bg-card p-8 text-center space-y-4">
      <h1 className="text-lg font-semibold">Dashboard failed to load</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong. Try again in a moment."}
      </p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
