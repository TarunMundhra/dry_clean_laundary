import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Live order tracking",
    description: "Monitor every ticket from intake to delivery with clear status stages."
  },
  {
    title: "Smart delivery ETA",
    description: "Auto-estimated dates based on garment workload and urgency."
  },
  {
    title: "Revenue snapshot",
    description: "Get real-time revenue and volume insights across your day."
  }
];

export const LandingPage = () => (
  <div className="min-h-screen bg-paper text-ink relative overflow-hidden">
    <div className="pointer-events-none absolute -top-40 right-10 h-72 w-72 rounded-full bg-coral/25 blur-3xl animate-float-slow" />
    <div className="pointer-events-none absolute top-32 -left-20 h-64 w-64 rounded-full bg-teal/20 blur-3xl animate-float-slow" />

    <header className="relative z-10 px-6 py-6 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate/70">Laundry Desk</p>
          <h1 className="font-display text-2xl md:text-3xl">Mini Laundry OMS</h1>
        </div>
        <Link
          to="/login"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper"
        >
          Admin Login
        </Link>
      </div>
    </header>

    <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 md:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Cleaner. Faster. Smarter.</p>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            A cozy command center for every dry-cleaning order.
          </h2>
          <p className="text-base text-slate md:text-lg">
            Track garments, estimate delivery times, and stay on top of your revenue
            with a single, focused workspace built for busy laundry counters.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper"
            >
              Sign in as admin
            </Link>
            <div className="rounded-full border border-ink/20 px-5 py-3 text-xs text-slate">
              Status flow: Received → Processing → Ready → Delivered
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Today</p>
          <h3 className="mt-2 font-display text-2xl">Everything in one glance</h3>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-ink/10 bg-mist/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-ink">12 orders</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-sand/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Revenue today</p>
              <p className="mt-1 text-2xl font-semibold text-ink">Rs. 4,960</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Next delivery</p>
              <p className="mt-1 text-2xl font-semibold text-ink">Tomorrow, 4 PM</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-ink/10 bg-white/80 px-5 py-4 shadow-soft"
          >
            <h4 className="font-semibold text-ink">{item.title}</h4>
            <p className="mt-2 text-sm text-slate">{item.description}</p>
          </div>
        ))}
      </section>
    </main>
  </div>
);
