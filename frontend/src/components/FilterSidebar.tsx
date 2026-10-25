import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getFilters, listVehicles } from '../api/vehicles';
import type { VehicleSearchParams } from '../api/vehicles';

type Props = {
  params: VehicleSearchParams;
  setParam: (key: keyof VehicleSearchParams, value?: string | number) => void;
  setPrice: (minPrice?: number, maxPrice?: number) => void;
  clear: () => void;
};

type DropdownProps = {
  label: string;
  value?: string;
  options: string[];
  onChange: (value?: string) => void;
  disabled?: boolean;
};

function optionLabel(option: string) {
  const labels: Record<string, string> = { NEW: 'New', USED: 'Used', PETROL: 'Petrol', DIESEL: 'Diesel', ELECTRIC: 'Electric', CNG: 'CNG', HYBRID: 'Hybrid', newest: 'Newest', price_asc: 'Price: low to high', price_desc: 'Price: high to low', year_desc: 'Newest year' };
  return labels[option] ?? option;
}

function FilterDropdown({ label, value, options, onChange, disabled = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? optionLabel(value) : label;

  return <div className="relative z-50 shrink-0">
    <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex min-w-28 items-center justify-between gap-4 rounded-md border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
      <span className="max-w-32 truncate">{selected}</span><span aria-hidden="true" className="text-amber-200">⌄</span>
    </button>
    {open && <div role="listbox" aria-label={`${label} options`} className="absolute left-0 z-50 mt-2 max-h-60 min-w-44 overflow-y-auto rounded-lg border border-amber-200 bg-white p-1 shadow-xl">
      <button type="button" role="option" aria-selected={!value} onClick={() => { onChange(undefined); setOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-amber-100">All</button>
      {options.map((option) => <button key={option} type="button" role="option" aria-selected={value === option} onClick={() => { onChange(option); setOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-amber-100">{optionLabel(option)}</button>)}
    </div>}
  </div>;
}

export function FilterSidebar({ params, setParam, clear }: Props) {
  const filtersQuery = useQuery({ queryKey: ['vehicle-filters'], queryFn: getFilters, staleTime: 300000 });
  const makeModelsQuery = useQuery({
    queryKey: ['vehicle-models', params.make],
    queryFn: () => listVehicles({ make: params.make, limit: 50 }),
    enabled: Boolean(params.make),
    placeholderData: keepPreviousData,
  });
  const filters = filtersQuery.data;
  const models = params.make
    ? [...new Set(makeModelsQuery.data?.items.map((vehicle) => vehicle.model) ?? [])].sort()
    : filters?.models ?? [];

  return <section aria-label="Vehicle filters" className="relative z-40 border-b border-amber-200 bg-amber-100">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 py-3">
      <span className="mr-1 text-base font-bold text-slate-900">Filters</span>
      <FilterDropdown label="Condition" value={params.condition} options={['NEW', 'USED']} onChange={(value) => setParam('condition', value)} />
      <FilterDropdown label="Fuel" value={params.fuelType} options={filters?.fuelTypes ?? []} onChange={(value) => setParam('fuelType', value)} />
      <FilterDropdown label="Make" value={params.make} options={filters?.makes ?? []} onChange={(value) => setParam('make', value)} />
      <FilterDropdown label="Model" value={params.model} options={models} onChange={(value) => setParam('model', value)} disabled={Boolean(params.make) && makeModelsQuery.isLoading} />
      <FilterDropdown label="Body type" value={params.category} options={filters?.categories ?? []} onChange={(value) => setParam('category', value)} />
      <FilterDropdown label="Transmission" value={params.transmission} options={filters?.transmissions ?? []} onChange={(value) => setParam('transmission', value)} />
      <FilterDropdown label="Sort" value={params.sort} options={['newest', 'price_asc', 'price_desc', 'year_desc']} onChange={(value) => setParam('sort', value)} />
      <button type="button" onClick={clear} className="rounded-md border border-brand-dark px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-amber-200">Clear</button>
    </div>
  </section>;
}
