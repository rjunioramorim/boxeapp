import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

      {/* Filtros skeleton */}
      <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted/80 animate-pulse" />
          <Input
            disabled
            className="pl-9 min-h-[44px] animate-pulse"
            placeholder=""
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <div className="space-y-1.5 flex-1">
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>
          <Button
            disabled
            variant="ghost"
            className="col-span-2 sm:col-span-1 h-11 text-muted-foreground animate-pulse"
          >
            <span className="h-4 w-20 rounded bg-muted" />
          </Button>
        </div>
      </div>

      {/* Contador + lista skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-muted/80 animate-pulse" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="h-5 w-32 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          {/* Mobile: cards skeleton */}
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border-l-4 border-muted bg-card"
              >
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded bg-muted/70 animate-pulse" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="h-3 w-10 rounded bg-muted/70 animate-pulse" />
                      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
                      <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table skeleton */}
          <div className="hidden md:block overflow-hidden rounded-md border text-base mt-4">
            <div className="w-full border-b bg-muted/40 px-4 py-3">
              <div className="flex gap-6">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted/80 animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-1 gap-6">
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-28 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-muted/70 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-muted/70 animate-pulse" />
                    <div className="h-6 w-20 rounded-full bg-muted/80 animate-pulse" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-24 rounded-md bg-muted/70 animate-pulse" />
                    <div className="h-8 w-24 rounded-md bg-muted/70 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

