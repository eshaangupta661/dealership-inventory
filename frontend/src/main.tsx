import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function App() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-900"><h1 className="text-2xl font-semibold">Dealership Inventory</h1></main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
