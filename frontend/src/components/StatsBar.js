import './StatsBar.css';
import { toINR, formatINR } from '../App';
const cards = [
  { key: 'totalTracked', label: 'Tracking',    color: '#38bdf8', bg: 'rgba(56,189,248,0.09)',  icon: '◈' },
  { key: 'activeItems',  label: 'Active',       color: '#4ade80', bg: 'rgba(74,222,128,0.09)',  icon: '◉' },
  { key: 'totalAlerts',  label: 'Alerts Fired', color: '#d4a843', bg: 'rgba(212,168,67,0.09)',  icon: '◎' },
  { key: 'avgSavings',   label: 'Avg Savings',  color: '#a78bfa', bg: 'rgba(167,139,250,0.09)', icon: '◇', rupee: true },
];
export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      {cards.map(c => (
        <div className="stat-card" key={c.key}>
          <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value" style={{ color: c.color }}>
            {c.rupee ? formatINR(toINR(stats[c.key] ?? 0)) : (stats[c.key] ?? 0)}
          </div>
        </div>
      ))}
    </div>
  );
}