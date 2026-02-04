"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Você está offline no momento
        </h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível conectar ao Boxeapp. Verifique sua conexão com a
          internet e tente novamente.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
        className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Tentar novamente
      </button>
    </div>
  );
}

