import { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import AddItemForm from './components/AddItemForm';
import ItemGrid from './components/ItemGrid';
import AlertsPanel from './components/AlertsPanel';
import NovaActLog from './components/NovaActLog';
import './App.css';

const API = '/api';

// Format price in Indian Rupees
export function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

// Rough USD → INR conversion (update rate as needed)
const USD_TO_INR = 83.5;
export function toINR(usd) {
  return Math.round(usd * USD_TO_INR * 100) / 100;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nt_user')); } catch { return null; }
  });
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [view, setView] = useState('tracker');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const addLog = (msg, type = 'info') =>
    setLogs(prev => [{ id: Date.now(), msg, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));

  const fetchAll = async () => {
    try {
      const [ir, ar, sr] = await Promise.all([
        fetch(`${API}/items`), fetch(`${API}/alerts`), fetch(`${API}/stats`)
      ]);
      setItems(await ir.json());
      setAlerts(await ar.json());
      setStats(await sr.json());
    } catch (e) { addLog(`Fetch error: ${e.message}`, 'error'); }
  };

  useEffect(() => {
    if (user) { fetchAll(); const t = setInterval(fetchAll, 30000); return () => clearInterval(t); }
  }, [user]);

  const handleSignIn = (u) => setUser(u);

  const handleSignOut = () => {
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  const handleAddItem = async (formData) => {
    setLoading(true);
    addLog(`Launching browser for ${new URL(formData.url).hostname}...`, 'nova');
    try {
      const res = await fetch(`${API}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const item = await res.json();
      const inr = formatINR(toINR(item.currentPrice));
      addLog(`Extracted: "${item.title}" @ ${inr}`, 'success');
      setShowForm(false);
      await fetchAll();
    } catch (e) { addLog(`Error: ${e.message}`, 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    addLog('Item removed', 'info');
    await fetchAll();
  };

  const handleCheck = async (id) => {
    const item = items.find(i => i.id === id);
    addLog(`Checking price for "${item?.title}"...`, 'nova');
    try {
      const res = await fetch(`${API}/items/${id}/check`, { method: 'POST' });
      if (!res.ok) throw new Error('Check failed');
      const updated = await res.json();
      addLog(`Updated: ${formatINR(toINR(updated.currentPrice))}`, 'success');
      await fetchAll();
    } catch (e) { addLog(`Check failed: ${e.message}`, 'error'); }
  };

  if (!user) return <SignIn onSignIn={handleSignIn} />;

  return (
    <div className="app">
      <div className="app-bg">
        <div className="grid-overlay" />
        <div className="light-streak" />
        <div className="light-streak" />
        <div className="light-streak" />
      </div>
      <Header view={view} setView={setView} alertCount={alerts.length} user={user} onSignOut={handleSignOut} />
      <main className="main">
        <StatsBar stats={stats} />
        {view === 'tracker' && (
          <div style={{ animation: 'float-up 0.4s ease' }}>
            <div className="section-header">
              <div>
                <div className="section-eyebrow">AI-Powered Tracking</div>
                <h2 className="section-headline">Tracked <em>Products</em></h2>
              </div>
              <button className="btn-add" onClick={() => setShowForm(s => !s)}>
                {showForm ? '✕ Cancel' : '+ Track Product'}
              </button>
            </div>
            {showForm && <AddItemForm onSubmit={handleAddItem} loading={loading} />}
            <ItemGrid items={items} onDelete={handleDelete} onCheck={handleCheck} />
          </div>
        )}
        {view === 'alerts' && (
          <div style={{ animation: 'float-up 0.4s ease' }}>
            <div className="section-header">
              <div>
                <div className="section-eyebrow">Price Drop History</div>
                <h2 className="section-headline">Alert <em>Feed</em></h2>
              </div>
            </div>
            <AlertsPanel alerts={alerts} />
          </div>
        )}
      </main>
      <NovaActLog logs={logs} />
    </div>
  );
}