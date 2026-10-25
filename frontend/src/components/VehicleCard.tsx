import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../api/types';
import { formatPrice } from '../lib/vehicles';

const GENERIC_CAR_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80';

function modelImageUrl(vehicle: Vehicle) {
  void vehicle;
  return GENERIC_CAR_IMAGE;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [imageSource, setImageSource] = useState(vehicle.imageUrl || modelImageUrl(vehicle));
  return <Link to={`/vehicles/${vehicle.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-dark to-emerald-600 p-5 text-center text-white">
      <img src={imageSource} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={() => setImageSource(GENERIC_CAR_IMAGE)} />
      <div className="absolute inset-0 bg-slate-950/40" aria-hidden="true" />
      <span className="absolute left-3 top-3 rounded-full bg-brand-light px-2 py-1 text-xs font-semibold text-brand-dark" aria-label={`${vehicle.category} body type`}>◈ {vehicle.category}</span>
      {vehicle.quantity === 0 && <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold">Sold out</span>}
      <div className="relative"><p className="text-xs uppercase tracking-widest text-emerald-100">{vehicle.make}</p><h2 className="mt-1 text-2xl font-bold">{vehicle.model}</h2></div>
    </div>
    <div className="p-4">
      <p className="truncate text-sm text-slate-600">{vehicle.variant} · {vehicle.color}</p>
      <p className="mt-2 text-xl font-bold text-brand-dark">{formatPrice(vehicle.price)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium text-slate-700">
        {[vehicle.fuelType, vehicle.transmission, String(vehicle.year), vehicle.kmDriven === 0 ? '0 km' : `${vehicle.kmDriven.toLocaleString('en-IN')} km`, `${vehicle.ownerCount} owner${vehicle.ownerCount === 1 ? '' : 's'}`].map((badge) => <span key={badge} className="rounded-full bg-brand-light px-2 py-1">{badge}</span>)}
        <span className="rounded-full bg-slate-100 px-2 py-1">{vehicle.condition === 'NEW' ? 'New' : 'Used'}</span>
      </div>
    </div>
  </Link>;
}

export function VehicleCardSkeleton() {
  return <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="h-44 bg-slate-200" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-6 w-1/2 rounded bg-slate-200" /><div className="h-4 rounded bg-slate-200" /></div></div>;
}
