import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left Half - Branding */}
      <div className="hidden lg:flex w-1/2 auth-gradient relative flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        {/* Subtle mesh/particle effect placeholder */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        
        {/* Logo Top Left */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Synqr</span>
        </div>

        {/* Taglines */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
            Plan. Build. Flow.
          </h1>
          <p className="text-lg text-white/70">
            Where dev teams stay in flow.
          </p>
        </div>
      </div>

      {/* Right Half - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
