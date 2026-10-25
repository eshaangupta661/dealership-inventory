import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const emailIsValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const safeRedirect = (value: string | null) => value?.startsWith('/') && !value.startsWith('//') ? value : '/';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailIsValid(email)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setError(''); setSubmitting(true);
    try { await login(email, password); navigate(safeRedirect(searchParams.get('redirect')), { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to log in.'); }
    finally { setSubmitting(false); }
  };
  return <main className="mx-auto max-w-md px-4 py-10"><h1 className="text-2xl font-bold text-brand-dark">Login</h1><form className="mt-6 space-y-4" onSubmit={submit} noValidate>
    <label className="block font-medium">Email<input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
    <label className="block font-medium">Password<input aria-label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={submitting} className="w-full rounded bg-brand-dark px-4 py-2 font-semibold text-white disabled:opacity-60">{submitting ? 'Logging in…' : 'Log in'}</button>
  </form><p className="mt-4 text-sm">Need an account? <Link className="font-semibold text-brand-dark underline" to="/register">Register</Link></p></main>;
}
