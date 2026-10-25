import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiError } from '../api/client';
import { getVehicle, purchaseVehicle } from '../api/vehicles';
import { useAuth } from '../auth/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatPrice } from '../lib/vehicles';

export function VehicleDetailPage() {
  const { id } = useParams();
  const vehicleId = Number(id);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const vehicleQuery = useQuery({ queryKey: ['vehicle', vehicleId], queryFn: () => getVehicle(vehicleId), enabled: Number.isInteger(vehicleId) && vehicleId > 0 });
  useEffect(() => {
    document.title = vehicleQuery.data ? `${vehicleQuery.data.make} ${vehicleQuery.data.model} | AutoHub` : 'Car details | AutoHub';
  }, [vehicleQuery.data]);
  const purchaseMutation = useMutation({
    mutationFn: () => purchaseVehicle(vehicleId),
    onSuccess: async () => {
      toast.success('Purchase successful');
      setConfirming(false);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] }), queryClient.invalidateQueries({ queryKey: ['vehicles'] })]);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error('This car was just sold out');
        setConfirming(false);
        void vehicleQuery.refetch();
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Unable to purchase this car');
    },
  });

  if (vehicleQuery.isLoading) return <main className="mx-auto max-w-5xl p-6">Loading vehicle…</main>;
  if (vehicleQuery.isError || !vehicleQuery.data) {
    if (vehicleQuery.error instanceof ApiError && vehicleQuery.error.status === 404) return <main className="mx-auto max-w-5xl p-6"><h1 className="text-2xl font-bold text-brand-dark">Car not found</h1><p className="mt-2 text-slate-700">This vehicle may have been removed.</p><button className="mt-3 rounded bg-brand-dark px-4 py-2 font-semibold text-white" onClick={() => navigate('/')}>Back to listings</button></main>;
    return <main className="mx-auto max-w-5xl p-6"><p className="text-red-700">We could not load this vehicle.</p><button className="mt-3 rounded bg-brand-dark px-4 py-2 font-semibold text-white" onClick={() => vehicleQuery.refetch()}>Retry</button></main>;
  }

  const vehicle = vehicleQuery.data;
  const imageSource = vehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
  const fields = [['Vehicle ID', vehicle.id], ['Make', vehicle.make], ['Model', vehicle.model], ['Variant', vehicle.variant], ['Category', vehicle.category], ['Condition', vehicle.condition === 'NEW' ? 'New' : 'Used'], ['Fuel type', vehicle.fuelType], ['Transmission', vehicle.transmission], ['Year', vehicle.year], ['Kilometres driven', vehicle.kmDriven.toLocaleString('en-IN')], ['Owners', vehicle.ownerCount], ['Color', vehicle.color], ['Available quantity', vehicle.quantity], ['Image URL', vehicle.imageUrl ?? 'Not provided'], ['Created', new Date(vehicle.createdAt).toLocaleString()], ['Last updated', new Date(vehicle.updatedAt).toLocaleString()]];
  const buy = () => {
    if (vehicle.quantity === 0) return;
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
    setConfirming(true);
  };

  return <main className="mx-auto max-w-5xl px-4 py-8">
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-brand-dark to-emerald-600 p-8 text-white"><p className="text-sm uppercase tracking-widest text-emerald-100">{vehicle.make}</p><h1 className="mt-1 text-3xl font-bold">{vehicle.model}</h1><p className="mt-2">{vehicle.variant}</p></div>
      <img src={imageSource} alt={`${vehicle.make} ${vehicle.model}`} className="h-64 w-full object-cover sm:h-96" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'; }} />
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto]"><dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>)}</dl><div className="md:min-w-56"><p className="text-2xl font-bold text-brand-dark">{formatPrice(vehicle.price)}</p><button onClick={buy} disabled={vehicle.quantity === 0} className="mt-4 w-full rounded bg-brand-dark px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400">{vehicle.quantity === 0 ? 'Sold out' : user ? 'Purchase' : 'Log in to purchase'}</button></div></div>
    </section>
    <ConfirmDialog open={confirming} title="Confirm purchase" description={`Purchase the ${vehicle.make} ${vehicle.model} for ${formatPrice(vehicle.price)}?`} confirmLabel="Confirm purchase" busy={purchaseMutation.isPending} onConfirm={() => purchaseMutation.mutate()} onClose={() => setConfirming(false)} />
  </main>;
}
