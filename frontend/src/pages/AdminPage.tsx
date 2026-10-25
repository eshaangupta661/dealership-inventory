import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiError } from '../api/client';
import { createVehicle, deleteVehicle, listVehicles, restockVehicle, updateVehicle } from '../api/vehicles';
import type { VehiclePayload } from '../api/vehicles';
import type { Vehicle } from '../api/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatPrice } from '../lib/vehicles';

const CATEGORIES = ['Hatchback', 'Sedan', 'SUV', 'MUV'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'] as const;
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC'] as const;
const CONDITIONS = ['NEW', 'USED'] as const;
const pageSize = 10;
type FormState = { make: string; model: string; variant: string; category: string; fuelType: Vehicle['fuelType']; transmission: Vehicle['transmission']; condition: Vehicle['condition']; year: string; kmDriven: string; ownerCount: string; price: string; quantity: string; color: string };
const blankForm = (): FormState => ({ make: '', model: '', variant: '', category: CATEGORIES[0], fuelType: FUEL_TYPES[0], transmission: TRANSMISSIONS[0], condition: CONDITIONS[0], year: String(new Date().getFullYear()), kmDriven: '0', ownerCount: '1', price: '', quantity: '0', color: '' });

function toForm(vehicle: Vehicle): FormState {
  return { make: vehicle.make, model: vehicle.model, variant: vehicle.variant, category: vehicle.category, fuelType: vehicle.fuelType, transmission: vehicle.transmission, condition: vehicle.condition, year: String(vehicle.year), kmDriven: String(vehicle.kmDriven), ownerCount: String(vehicle.ownerCount), price: String(vehicle.price), quantity: String(vehicle.quantity), color: vehicle.color };
}

function validate(form: FormState): string | null {
  if (!form.make.trim() || !form.model.trim() || !form.variant.trim() || !form.color.trim()) return 'Make, model, variant, and color are required.';
  const values = { year: Number(form.year), kmDriven: Number(form.kmDriven), ownerCount: Number(form.ownerCount), price: Number(form.price), quantity: Number(form.quantity) };
  if (!Object.values(values).every(Number.isInteger)) return 'Year, kilometres, owners, price, and quantity must be whole numbers.';
  if (values.year < 1990 || values.year > new Date().getFullYear() + 1) return `Year must be between 1990 and ${new Date().getFullYear() + 1}.`;
  if (values.kmDriven < 0 || values.quantity < 0 || values.ownerCount < 1 || values.price < 1) return 'Kilometres and quantity cannot be negative; owners and price must be at least 1.';
  return null;
}

export function AdminPage() {
  useEffect(() => { document.title = 'Admin | AutoHub'; }, []);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [amount, setAmount] = useState('');
  const [restockError, setRestockError] = useState('');
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const vehiclesQuery = useQuery({ queryKey: ['vehicles', 'admin', page], queryFn: () => listVehicles({ page, limit: pageSize }) });
  const rejectUnauthorized = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) return true;
    if (error instanceof ApiError && error.status === 403) { toast.error('Please log in with an administrator account.'); navigate('/login'); return true; }
    return false;
  };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  const saveMutation = useMutation({
    mutationFn: (payload: VehiclePayload) => editing ? updateVehicle(editing.id, payload) : createVehicle(payload),
    onSuccess: async () => { toast.success(editing ? 'Vehicle updated' : 'Vehicle created'); closeForm(); await invalidate(); },
    onError: (error) => { if (!rejectUnauthorized(error)) setFormError(error instanceof Error ? error.message : 'Unable to save vehicle.'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: async () => { toast.success('Vehicle deleted'); setDeleting(null); await invalidate(); },
    onError: (error) => { if (!rejectUnauthorized(error)) toast.error(error instanceof Error ? error.message : 'Unable to delete vehicle.'); },
  });
  const restockMutation = useMutation({
    mutationFn: ({ id, restockAmount }: { id: number; restockAmount: number }) => restockVehicle(id, restockAmount),
    onSuccess: async () => { toast.success('Inventory restocked'); closeRestock(); await invalidate(); },
    onError: (error) => { if (!rejectUnauthorized(error)) setRestockError(error instanceof Error ? error.message : 'Unable to restock vehicle.'); },
  });
  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    const validationError = validate(form);
    if (validationError) return setFormError(validationError);
    setFormError('');
    saveMutation.mutate({ ...form, make: form.make.trim(), model: form.model.trim(), variant: form.variant.trim(), color: form.color.trim(), year: Number(form.year), kmDriven: Number(form.kmDriven), ownerCount: Number(form.ownerCount), price: Number(form.price), quantity: Number(form.quantity) });
  };
  const submitRestock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isInteger(parsed) || parsed < 1) return setRestockError('Restock amount must be a positive whole number.');
    if (restocking) restockMutation.mutate({ id: restocking.id, restockAmount: parsed });
  };
  const data = vehiclesQuery.data;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const returnFocus = () => window.setTimeout(() => dialogTrigger.current?.focus(), 0);
  const closeForm = () => { setForm(null); setEditing(null); returnFocus(); };
  const closeRestock = () => { setRestocking(null); setAmount(''); returnFocus(); };

  return <main className="mx-auto max-w-7xl px-4 py-8">
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-brand-dark">Inventory management</h1><p className="text-slate-600">{data?.total ?? 0} vehicles</p></div><button onClick={(event) => { dialogTrigger.current = event.currentTarget; setEditing(null); setFormError(''); setForm(blankForm()); }} className="rounded bg-brand-dark px-4 py-2 font-semibold text-white">Add vehicle</button></div>
    {vehiclesQuery.isError ? <div className="rounded border border-red-200 bg-red-50 p-5 text-red-800">Unable to load inventory.<button onClick={() => vehiclesQuery.refetch()} className="ml-3 underline">Retry</button></div> : <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[700px] text-left"><thead className="bg-slate-50 text-sm text-slate-600"><tr><th className="p-3">Make / model</th><th className="p-3">Year</th><th className="p-3">Price</th><th className="p-3">Quantity</th><th className="p-3">Actions</th></tr></thead><tbody>{vehiclesQuery.isLoading ? <tr><td className="p-6" colSpan={5}>Loading inventory…</td></tr> : data?.items.map((vehicle) => <tr key={vehicle.id} className="border-t"><td className="p-3 font-medium">{vehicle.make} {vehicle.model}</td><td className="p-3">{vehicle.year}</td><td className="p-3">{formatPrice(vehicle.price)}</td><td className="p-3">{vehicle.quantity}</td><td className="p-3"><div className="flex gap-2"><button onClick={(event) => { dialogTrigger.current = event.currentTarget; setEditing(vehicle); setFormError(''); setForm(toForm(vehicle)); }} className="rounded border px-3 py-1">Edit</button><button onClick={(event) => { dialogTrigger.current = event.currentTarget; setRestocking(vehicle); setRestockError(''); setAmount(''); }} className="rounded border px-3 py-1">Restock</button><button onClick={() => setDeleting(vehicle)} className="rounded border border-red-300 px-3 py-1 text-red-700">Delete</button></div></td></tr>)}</tbody></table></div>}
    {!vehiclesQuery.isLoading && !vehiclesQuery.isError && data?.items.length === 0 && <p className="mt-4 rounded border border-slate-200 bg-slate-50 p-5 text-slate-700">No vehicles in inventory yet.</p>}
    <div className="mt-4 flex justify-end gap-3"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span className="py-2">Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div>
    {form && <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/40 p-4"><form role="dialog" aria-modal="true" aria-labelledby="vehicle-form-title" onSubmit={submitForm} noValidate className="mx-auto my-8 max-w-2xl rounded-xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h2 id="vehicle-form-title" className="text-xl font-bold">{editing ? 'Edit vehicle' : 'Add vehicle'}</h2><button type="button" onClick={closeForm}>Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
      {(['make', 'model', 'variant', 'color'] as const).map((key) => <label key={key} className="block capitalize">{key}<input value={form[key]} onChange={(event) => setValue(key, event.target.value)} className="mt-1 w-full rounded border p-2" /></label>)}
      <label>Category<select value={form.category} onChange={(event) => setValue('category', event.target.value)} className="mt-1 w-full rounded border p-2">{CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Fuel type<select value={form.fuelType} onChange={(event) => setValue('fuelType', event.target.value as FormState['fuelType'])} className="mt-1 w-full rounded border p-2">{FUEL_TYPES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Transmission<select value={form.transmission} onChange={(event) => setValue('transmission', event.target.value as FormState['transmission'])} className="mt-1 w-full rounded border p-2">{TRANSMISSIONS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Condition<select value={form.condition} onChange={(event) => setValue('condition', event.target.value as FormState['condition'])} className="mt-1 w-full rounded border p-2">{CONDITIONS.map((value) => <option key={value}>{value}</option>)}</select></label>
      {(['year', 'kmDriven', 'ownerCount', 'price', 'quantity'] as const).map((key) => <label key={key} className="block">{key === 'kmDriven' ? 'Kilometres driven' : key}<input inputMode="numeric" value={form[key]} onChange={(event) => setValue(key, event.target.value)} className="mt-1 w-full rounded border p-2" /></label>)}
    </div>{formError && <p role="alert" className="mt-4 text-red-700">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded border px-4 py-2">Cancel</button><button disabled={saveMutation.isPending} className="rounded bg-brand-dark px-4 py-2 font-semibold text-white">{saveMutation.isPending ? 'Saving…' : 'Save vehicle'}</button></div></form></div>}
    {restocking && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"><form role="dialog" aria-modal="true" aria-labelledby="restock-title" onSubmit={submitRestock} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 id="restock-title" className="text-xl font-bold">Restock {restocking.make} {restocking.model}</h2><label className="mt-4 block">Amount<input aria-label="Restock amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>{restockError && <p role="alert" className="mt-3 text-red-700">{restockError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeRestock} className="rounded border px-4 py-2">Cancel</button><button disabled={restockMutation.isPending} className="rounded bg-brand-dark px-4 py-2 font-semibold text-white">Confirm restock</button></div></form></div>}
    <ConfirmDialog open={Boolean(deleting)} title="Delete vehicle" description={deleting ? `Delete ${deleting.make} ${deleting.model}? This cannot be undone.` : ''} confirmLabel="Delete" busy={deleteMutation.isPending} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} onClose={() => setDeleting(null)} />
  </main>;
}
