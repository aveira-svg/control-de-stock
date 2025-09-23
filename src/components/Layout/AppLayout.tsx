import type { ReactNode } from 'react'

interface AppLayoutProps { children: ReactNode }

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-dvh text-slate-900">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl"></div>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-[36rem] bg-gradient-to-tr from-white via-sky-50 to-indigo-50 opacity-70 blur-2xl"></div>
      </div>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-950">Control de Préstamos</h1>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <a href="/" className="text-slate-700 hover:text-slate-900">Dashboard</a>
            <a href="/config" className="text-slate-700 hover:text-slate-900">Configuración</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-8">
        <div className="grid gap-4 animate-in">
          {children}
        </div>
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-slate-700 flex items-center justify-around">
          <a href="/" className="hover:text-slate-900">Inicio</a>
          <a href="/config" className="hover:text-slate-900">Config</a>
        </div>
      </nav>
    </div>
  )
}


