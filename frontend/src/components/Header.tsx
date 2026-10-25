import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-3 sm:flex-nowrap sm:items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-light">AutoHub</Link>
        <button type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((open) => !open)} className="ml-auto rounded border border-brand-light px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-light sm:hidden">Menu</button>
        <form onSubmit={onSearch} className="flex flex-1 gap-2 sm:mx-4">
          <label className="sr-only" htmlFor="vehicle-search">Search vehicles</label>
          <input
            id="vehicle-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search make, model or variant"
            className="min-w-0 flex-1 rounded-md px-3 py-2 text-slate-900 outline-none ring-brand-light focus:ring-2"
          />
          <button className="rounded-md bg-brand-light px-4 py-2 font-semibold text-brand-dark hover:bg-white focus:outline-none focus:ring-2 focus:ring-white" type="submit">Search</button>
        </form>
        <nav id="site-menu" className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-wrap items-center gap-3 text-sm sm:flex sm:w-auto`}>
          {user ? <>
            <span className="max-w-44 truncate" title={user.email}>{user.email}</span>
            {isAdmin && <Link className="rounded px-2 py-1 hover:bg-brand-light hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light" to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
            <button className="rounded border border-brand-light px-3 py-1 hover:bg-brand-light hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light" onClick={logout}>Logout</button>
          </> : <>
            <Link className="rounded px-2 py-1 hover:bg-brand-light hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light" to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link className="rounded border border-brand-light px-3 py-1 hover:bg-brand-light hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light" to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>}
        </nav>
      </div>
    </header>
  );
}
