import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded-md bg-muted/70 animate-pulse" />
        </div>
        <Button
          disabled
          className="min-h-[44px] touch-manipulation w-full sm:w-auto animate-pulse"
        >
          <span className="h-4 w-24 rounded bg-muted" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="h-5 w-40 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded-md bg-muted/70 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile: cards skeleton */}
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-28 rounded bg-muted/70 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          {/* Desktop: table skeleton */}
          <div className="hidden md:block overflow-hidden rounded-md border">
            <div className="w-full border-b bg-muted/40 px-4 py-3">
              <div className="flex gap-4">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted/80 animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-1 gap-4">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-muted/80 animate-pulse" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted/70 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

