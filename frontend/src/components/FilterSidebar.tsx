import { useEffect, useState, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getFilters, listVehicles } from '../api/vehicles';
import type { VehicleSearchParams } from '../api/vehicles';

type Props = {
  params: VehicleSearchParams;
  setParam: (key: keyof VehicleSearchParams, value?: string | number) => void;
  setPrice: (minPrice?: number, maxPrice?: number) => void;
  clear: () => void;
};

const selectClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark';

export function FilterSidebar({ params, setParam, setPrice, clear }: Props) {
  const [open, setOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? '');
  const filtersQuery = useQuery({ queryKey: ['vehicle-filters'], queryFn: getFilters, staleTime: 300000 });
  const makeModelsQuery = useQuery({
    queryKey: ['vehicle-models', params.make],
    queryFn: () => listVehicles({ make: params.make, limit: 50 }),
    enabled: Boolean(params.make),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const toNumber = (value: string) => value === '' || !Number.isFinite(Number(value)) ? undefined : Number(value);
      setPrice(toNumber(minPrice), toNumber(maxPrice));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [minPrice, maxPrice]); // URL state updates are intentionally debounced.

  const filters = filtersQuery.data;
  const models = params.make
    ? [...new Set(makeModelsQuery.data?.items.map((vehicle) => vehicle.model) ?? [])].sort()
    : filters?.models ?? [];

  const field = (label: string, child: ReactNode) => <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">{label}</span>{child}</label>;
  const content = <div className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-brand-dark">Filters</h2><button onClick={clear} className="text-sm font-semibold text-brand-dark underline">Clear all</button></div>
    <div className="grid grid-cols-2 gap-2">
      {field('Min price', <input aria-label="Min price" className={selectClass} inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="₹" />)}
      {field('Max price', <input aria-label="Max price" className={selectClass} inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="₹" />)}
    </div>
    <div className="grid grid-cols-2 gap-2">
      {field('Min year', <input className={selectClass} inputMode="numeric" value={params.minYear ?? ''} onChange={(event) => setParam('minYear', event.target.value || undefined)} />)}
      {field('Max year', <input className={selectClass} inputMode="numeric" value={params.maxYear ?? ''} onChange={(event) => setParam('maxYear', event.target.value || undefined)} />)}
    </div>
    {field('Max km', <input className={selectClass} inputMode="numeric" value={params.maxKm ?? ''} onChange={(event) => setParam('maxKm', event.target.value || undefined)} placeholder="Any distance" />)}
    {field('Body type', <select className={selectClass} value={params.category ?? ''} onChange={(event) => setParam('category', event.target.value || undefined)}><option value="">All types</option>{filters?.categories.map((value) => <option key={value}>{value}</option>)}</select>)}
    {field('Transmission', <select className={selectClass} value={params.transmission ?? ''} onChange={(event) => setParam('transmission', event.target.value || undefined)}><option value="">All transmissions</option>{filters?.transmissions.map((value) => <option key={value}>{value}</option>)}</select>)}
    {field('Make', <select className={selectClass} value={params.make ?? ''} onChange={(event) => setParam('make', event.target.value || undefined)}><option value="">All makes</option>{filters?.makes.map((value) => <option key={value}>{value}</option>)}</select>)}
    {field('Model', <select className={selectClass} value={params.model ?? ''} onChange={(event) => setParam('model', event.target.value || undefined)} disabled={Boolean(params.make) && makeModelsQuery.isLoading}><option value="">All models</option>{models.map((value) => <option key={value}>{value}</option>)}</select>)}
    {field('Sort', <select className={selectClass} value={params.sort ?? 'newest'} onChange={(event) => setParam('sort', event.target.value)}><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="newest">Newest</option><option value="year_desc">Year</option></select>)}
  </div>;

  return <>
    <button onClick={() => setOpen(true)} className="mb-4 rounded-md bg-brand-dark px-4 py-2 text-sm font-semibold text-white lg:hidden">Filters</button>
    <aside className="sticky top-4 hidden h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:block">{content}</aside>
    {open && <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"><aside className="h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl"><div className="mb-4 text-right"><button onClick={() => setOpen(false)} className="rounded px-2 py-1 text-sm font-semibold text-brand-dark">Close</button></div>{content}</aside></div>}
  </>;
}
