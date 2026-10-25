import { useEffect } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listVehicles } from '../api/vehicles';
import type { VehicleSearchParams } from '../api/vehicles';
import { FilterSidebar } from '../components/FilterSidebar';
import { VehicleCard, VehicleCardSkeleton } from '../components/VehicleCard';
import { buildQueryParams } from '../lib/vehicles';

const CHIP_FILTERS = [
  { label: 'All', key: undefined, value: undefined },
  { label: 'New', key: 'condition', value: 'NEW' },
  { label: 'Used', key: 'condition', value: 'USED' },
  { label: 'Petrol', key: 'fuelType', value: 'PETROL' },
  { label: 'Diesel', key: 'fuelType', value: 'DIESEL' },
  { label: 'Electric', key: 'fuelType', value: 'ELECTRIC' },
  { label: 'CNG', key: 'fuelType', value: 'CNG' },
] as const;

export function ListingPage() {
  useEffect(() => { document.title = 'Vehicle listings | AutoHub'; }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = buildQueryParams(searchParams);
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => listVehicles(params),
    placeholderData: keepPreviousData,
  });

  const setParam = (key: keyof VehicleSearchParams, value?: string | number) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, String(value));
    if (key === 'make') next.delete('model');
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };
  const clear = () => setSearchParams(new URLSearchParams());
  const setPrice = (minPrice?: number, maxPrice?: number) => {
    const next = new URLSearchParams(searchParams);
    if (minPrice === undefined) next.delete('minPrice'); else next.set('minPrice', String(minPrice));
    if (maxPrice === undefined) next.delete('maxPrice'); else next.set('maxPrice', String(maxPrice));
    next.delete('page');
    setSearchParams(next);
  };
  const chooseChip = (key?: 'condition' | 'fuelType', value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!key) { next.delete('condition'); next.delete('fuelType'); }
    else next.set(key, value!);
    next.delete('page');
    setSearchParams(next);
  };
  const data = vehiclesQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const currentPage = data?.page ?? params.page ?? 1;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

  return <main className="mx-auto max-w-7xl px-4 py-6">
    <div className="mb-6 flex flex-wrap gap-2">
      {CHIP_FILTERS.map((chip) => {
        const active = chip.key ? params[chip.key] === chip.value : !params.condition && !params.fuelType;
        return <button key={chip.label} onClick={() => chooseChip(chip.key, chip.value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-brand-dark text-white' : 'bg-brand-light text-brand-dark hover:bg-emerald-200'}`}>{chip.label}</button>;
      })}
    </div>
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <FilterSidebar params={params} setParam={setParam} setPrice={setPrice} clear={clear} />
      <section>
        <div className="mb-4 flex items-center justify-between"><p className="font-semibold text-slate-700">{data?.total ?? 0} cars</p>{vehiclesQuery.isPlaceholderData && <span className="text-sm text-slate-500">Updating...</span>}</div>
        {vehiclesQuery.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"><p>We could not load vehicles.</p><button onClick={() => vehiclesQuery.refetch()} className="mt-3 rounded bg-brand-dark px-4 py-2 font-semibold text-white">Retry</button></div>
          : vehiclesQuery.isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <VehicleCardSkeleton key={index} />)}</div>
          : data?.items.length ? <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2"><button disabled={currentPage === 1} onClick={() => setParam('page', currentPage - 1)} className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button>{pages.map((page) => <button key={page} onClick={() => setParam('page', page)} className={`rounded px-3 py-2 text-sm ${page === currentPage ? 'bg-brand-dark text-white' : 'bg-brand-light text-brand-dark'}`}>{page}</button>)}<button disabled={currentPage === totalPages} onClick={() => setParam('page', currentPage + 1)} className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav></>
          : <div className="rounded-xl bg-brand-light p-8 text-center"><h2 className="text-xl font-bold text-brand-dark">No cars match your filters</h2><button onClick={clear} className="mt-4 rounded bg-brand-dark px-4 py-2 font-semibold text-white">Clear filters</button></div>}
      </section>
    </div>
  </main>;
}

export function Page({ title, description }: { title: string; description: string }) {
  return <main className="mx-auto max-w-7xl px-4 py-10"><section className="rounded-xl bg-brand-light p-6"><h1 className="text-2xl font-bold text-brand-dark">{title}</h1><p className="mt-2 text-slate-700">{description}</p></section></main>;
}
