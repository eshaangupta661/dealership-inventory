import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found | AutoHub'; }, []);
  return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-3xl font-bold text-brand-dark">Page not found</h1><p className="mt-3 text-slate-700">The page you requested does not exist.</p><Link to="/" className="mt-6 inline-block rounded bg-brand-dark px-4 py-2 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-dark">Back to listings</Link></main>;
}
