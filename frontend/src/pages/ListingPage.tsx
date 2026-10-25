import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { listVehicles } from '../api/vehicles';
import type { VehicleSearchParams } from '../api/vehicles';
import type { Vehicle } from '../api/types';
import { FilterSidebar } from '../components/FilterSidebar';
import { VehicleCard, VehicleCardSkeleton } from '../components/VehicleCard';
import { buildQueryParams } from '../lib/vehicles';

function vehicleImageUrl(vehicle: Vehicle) {
  return vehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
}

function FeaturedCars({ vehicles }: { vehicles: Vehicle[] }) {
  const featured = vehicles.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % featured.length), 4000);
    return () => window.clearInterval(interval);
  }, [featured.length]);

  if (!featured.length) return null;
  const vehicle = featured[activeIndex % featured.length];
  return <section aria-label="Featured cars" className="mb-8 overflow-hidden rounded-2xl bg-brand-dark shadow-lg">
    <div className="relative h-64 sm:h-80">
      <img key={vehicle.id} src={vehicleImageUrl(vehicle)} alt={`${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'; }} />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 text-white sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Featured car</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">{vehicle.make} {vehicle.model}</h2><p className="mt-2 text-slate-100">{vehicle.variant} · {vehicle.year} · {vehicle.fuelType}</p><Link to={`/vehicles/${vehicle.id}`} className="mt-5 w-fit rounded-md bg-amber-300 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-200">View car</Link></div>
      {featured.length > 1 && <div className="absolute bottom-4 right-5 flex gap-2">{featured.map((item, index) => <button key={item.id} type="button" aria-label={`Show featured ${item.make} ${item.model}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-2.5 w-2.5 rounded-full ${index === activeIndex ? 'bg-amber-300' : 'bg-white/60'}`} />)}</div>}
    </div>
  </section>;
}

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
  const data = vehiclesQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const currentPage = data?.page ?? params.page ?? 1;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

  return <>
    <FilterSidebar params={params} setParam={setParam} setPrice={setPrice} clear={clear} />
    <main className="mx-auto max-w-7xl px-4 py-6">
    {data?.items.length ? <FeaturedCars vehicles={data.items} /> : null}
    <section>
        <div className="mb-4 flex items-center justify-end"><p className="sr-only">{data?.total ?? 0} cars</p>{vehiclesQuery.isPlaceholderData && <span className="text-sm text-slate-500">Updating...</span>}</div>
        {vehiclesQuery.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"><p>We could not load vehicles.</p><button onClick={() => vehiclesQuery.refetch()} className="mt-3 rounded bg-brand-dark px-4 py-2 font-semibold text-white">Retry</button></div>
          : vehiclesQuery.isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <VehicleCardSkeleton key={index} />)}</div>
          : data?.items.length ? <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.items.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2"><button disabled={currentPage === 1} onClick={() => setParam('page', currentPage - 1)} className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button>{pages.map((page) => <button key={page} onClick={() => setParam('page', page)} className={`rounded px-3 py-2 text-sm ${page === currentPage ? 'bg-brand-dark text-white' : 'bg-brand-light text-brand-dark'}`}>{page}</button>)}<button disabled={currentPage === totalPages} onClick={() => setParam('page', currentPage + 1)} className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav></>
          : <div className="rounded-xl bg-brand-light p-8 text-center"><h2 className="text-xl font-bold text-brand-dark">No cars match your filters</h2><button onClick={clear} className="mt-4 rounded bg-brand-dark px-4 py-2 font-semibold text-white">Clear filters</button></div>}
    </section>
    </main>
  </>;
}

export function Page({ title, description }: { title: string; description: string }) {
  return <main className="mx-auto max-w-7xl px-4 py-10"><section className="rounded-xl bg-brand-light p-6"><h1 className="text-2xl font-bold text-brand-dark">{title}</h1><p className="mt-2 text-slate-700">{description}</p></section></main>;
}
