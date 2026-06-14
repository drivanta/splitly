import { CreateGroupForm } from "@/components/create-group-form";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 pb-16 pt-12 sm:pt-20">
      <header className="mb-10 text-center sm:mb-14">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-navy/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-navy/70">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
          splitly
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Split bills with friends.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-brand-navy/70 sm:text-base">
          No login. No app. Just a shareable link with live balances and a
          settlement plan.
        </p>
      </header>

      <section className="card">
        <h2 className="mb-1 text-lg font-semibold">Create a group</h2>
        <p className="mb-5 text-sm text-brand-navy/60">
          Add a name, currency, and the people splitting. You will get a link
          you can share with everyone.
        </p>
        <CreateGroupForm />
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-brand-navy/50">
        Built by Drivanta Labs. Open source.
      </footer>
    </main>
  );
}
