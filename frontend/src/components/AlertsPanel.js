import './AlertsPanel.css';
import { toINR, formatINR } from '../App';
export default function AlertsPanel({ alerts }) {
  if (!alerts?.length) return (
    <div className="alerts-empty">
      <div className="ae-icon">◎</div>
      <div className="ae-title">No alerts fired yet</div>
      <div className="ae-sub">When a product hits your target price, the alert appears here</div>
    </div>
  );
  return (
    <div className="alerts-list">
      {[...alerts].reverse().map((a, i) => (
        <div className="alert-card" key={a.id} style={{ animationDelay: `${i * 0.04}s` }}>
          <div className="al-icon">🎯</div>
          <div className="al-body">
            <div className="al-title">{a.title}</div>
            <a className="al-link" href={a.url} target="_blank" rel="noreferrer">View product ↗</a>
          </div>
          <div className="al-prices">
            <div className="al-hit">{formatINR(toINR(a.triggeredPrice))}</div>
            <div className="al-target">Target was {formatINR(toINR(a.targetPrice))}</div>
            <div className="al-saved">You saved {formatINR(toINR(Math.abs(a.targetPrice - a.triggeredPrice)))}</div>
          </div>
          <div className="al-time">{new Date(a.triggeredAt).toLocaleString('en-IN')}</div>
        </div>
      ))}
    </div>
  );
}