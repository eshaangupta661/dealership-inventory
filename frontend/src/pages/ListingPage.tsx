export function ListingPage() {
  return <Page title="Vehicle listings" description="Browse and filter the dealership inventory here." />;
}

export function Page({ title, description }: { title: string; description: string }) {
  return <main className="mx-auto max-w-7xl px-4 py-10"><section className="rounded-xl bg-brand-light p-6"><h1 className="text-2xl font-bold text-brand-dark">{title}</h1><p className="mt-2 text-slate-700">{description}</p></section></main>;
}
