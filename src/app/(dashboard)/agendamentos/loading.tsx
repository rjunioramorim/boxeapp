import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-muted/70 animate-pulse" />
        </div>
      </div>

      {/* Date selector skeleton */}
      <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm sticky top-0 md:relative z-20">
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="h-12 w-12 animate-pulse"
        >
          <span className="h-5 w-5 rounded-full bg-muted" />
        </Button>

        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-40 rounded-lg bg-muted/70 animate-pulse" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled
          className="h-12 w-12 animate-pulse"
        >
          <span className="h-5 w-5 rounded-full bg-muted" />
        </Button>
      </div>

      {/* Lista de aulas do dia - skeleton */}
      <div className="space-y-4 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="border rounded-xl px-4 bg-card shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="bg-muted p-2.5 rounded-lg animate-pulse h-10 w-10" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>

              <div className="hidden sm:flex flex-1 items-center gap-6 text-sm">
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <div className="h-3 w-10 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-6 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-8 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-8 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex justify-end mb-4">
                <div className="h-9 w-40 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border bg-muted/20 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-20 rounded bg-muted/70 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

