export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 md:px-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden space-y-6 lg:block">
          <p className="font-display text-6xl leading-none text-[var(--deep)]">
            Brhium
            <br />
            Voice Hub
          </p>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
            Un panel para ensenar el agente en directo, controlar numeros activos, revisar
            transcripciones y dar al cliente una vista clara de lo que esta ocurriendo.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel p-4">
              <p className="text-sm text-[var(--muted)]">Demo web</p>
              <p className="mt-2 font-display text-2xl text-[var(--deep)]">Browser voice</p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-[var(--muted)]">Supervision</p>
              <p className="mt-2 font-display text-2xl text-[var(--deep)]">Historial vivo</p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-[var(--muted)]">Operacion</p>
              <p className="mt-2 font-display text-2xl text-[var(--deep)]">Control total</p>
            </div>
          </div>
        </section>
        {children}
      </div>
    </div>
  )
}
