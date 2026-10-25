import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const navigate = useNavigate();

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) params.set('q', search.trim());
    else params.delete('q');
    navigate(`/?${params.toString()}`);
  };

  return (
    <header className="bg-brand-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">AutoHub</Link>
        <form onSubmit={onSearch} className="flex flex-1 gap-2 sm:mx-4">
          <label className="sr-only" htmlFor="vehicle-search">Search vehicles</label>
          <input
            id="vehicle-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search make, model or variant"
            className="min-w-0 flex-1 rounded-md px-3 py-2 text-slate-900 outline-none ring-brand-light focus:ring-2"
          />
          <button className="rounded-md bg-brand-light px-4 py-2 font-semibold text-brand-dark hover:bg-white" type="submit">Search</button>
        </form>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {user ? <>
            <span className="max-w-44 truncate" title={user.email}>{user.email}</span>
            {isAdmin && <Link className="rounded px-2 py-1 hover:bg-brand-light hover:text-brand-dark" to="/admin">Admin</Link>}
            <button className="rounded border border-brand-light px-3 py-1 hover:bg-brand-light hover:text-brand-dark" onClick={logout}>Logout</button>
          </> : <>
            <Link className="rounded px-2 py-1 hover:bg-brand-light hover:text-brand-dark" to="/login">Login</Link>
            <Link className="rounded border border-brand-light px-3 py-1 hover:bg-brand-light hover:text-brand-dark" to="/register">Register</Link>
          </>}
        </nav>
      </div>
    </header>
  );
}
