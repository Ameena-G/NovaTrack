import './ItemGrid.css';
import { toINR, formatINR } from '../App';

function ItemCard({ item, onDelete, onCheck }) {
  const currentINR = toINR(item.currentPrice || 0);
  const targetINR  = toINR(item.targetPrice  || 0);
  const initialINR = toINR(item.initialPrice || item.currentPrice || 0);
  const hit = item.currentPrice != null && item.currentPrice <= item.targetPrice;
  const drop = item.initialPrice && item.currentPrice < item.initialPrice;
  const dropPct = item.initialPrice ? Math.round(((item.initialPrice - item.currentPrice) / item.initialPrice) * 100) : 0;
  const max = Math.max(initialINR, currentINR, targetINR) * 1.08;
  const fillPct = Math.min(100, Math.max(0, (currentINR / max) * 100));
  const pinPct  = Math.min(100, Math.max(0, (targetINR  / max) * 100));
  const lastChecked = item.lastChecked ? new Date(item.lastChecked).toLocaleString('en-IN') : 'Never';
  const hostname = (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })();

  return (
    <div className={`item-card ${hit ? 'item-card--hit' : ''}`}>
      {hit && <div className="hit-ribbon">🎯 Target Price Reached</div>}
      <div className="card-top" style={hit ? { marginTop: 18 } : {}}>
        {item.imageUrl
          ? <img className="card-img" src={item.imageUrl} alt={item.title} />
          : <div className="card-img-ph">◈</div>}
        <div className="card-meta">
          <div className="card-title">{item.title || 'Loading...'}</div>
          <a className="card-host" href={item.url} target="_blank" rel="noreferrer">{hostname} ↗</a>
        </div>
      </div>
      <div className="price-band">
        <div>
          <div className="p-label">Current Price</div>
          <div className="p-val" style={{ color: hit ? 'var(--green)' : 'var(--cyan)' }}>
            {formatINR(currentINR)}
          </div>
          {drop && dropPct > 0 && <div className="p-drop">↓ {dropPct}% from {formatINR(initialINR)}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="p-label">Your Target</div>
          <div className="p-val p-val--muted">{formatINR(targetINR)}</div>
        </div>
      </div>
      <div className="prog-wrap">
        <div className="prog-track">
          <div className="prog-fill" style={{ width: `${fillPct}%` }} />
          <div className="prog-pin" style={{ left: `${pinPct}%` }} title={`Target ${formatINR(targetINR)}`} />
        </div>
        <div className="prog-lbls">
          <span>₹0</span>
          <span>Target {formatINR(targetINR)}</span>
          <span>{formatINR(Math.round(max))}</span>
        </div>
      </div>
      <div className="card-foot">
        <div className="card-ts"><span className="ts-dot" />{lastChecked}</div>
        <div className="card-acts">
          <button className="btn-r" onClick={() => onCheck(item.id)}>↻ Refresh</button>
          <button className="btn-x" onClick={() => onDelete(item.id)}>✕</button>
        </div>
      </div>
      {item.error && <div className="card-err">⚠ {item.error}</div>}
    </div>
  );
}

export default function ItemGrid({ items, onDelete, onCheck }) {
  if (!items?.length) return (
    <div className="empty-state">
      <div className="empty-ring">◈</div>
      <div className="empty-title">No products tracked yet</div>
      <div className="empty-sub">Add a product URL above — the AI will browse it in a real browser and extract the price in ₹ automatically</div>
    </div>
  );
  return (
    <div className="item-grid">
      {items.map((item, i) => (
        <div key={item.id} style={{ animation: `float-up 0.3s ease ${i * 0.06}s both` }}>
          <ItemCard item={item} onDelete={onDelete} onCheck={onCheck} />
        </div>
      ))}
    </div>
  );
}