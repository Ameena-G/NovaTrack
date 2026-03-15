import { useState } from 'react';
import './NovaActLog.css';
const TYPE = {
  info:    { color: 'var(--muted2)',  pre: '›' },
  nova:    { color: 'var(--cyan)',    pre: '⬡' },
  success: { color: 'var(--green)',   pre: '✓' },
  error:   { color: 'var(--danger)',  pre: '✗' },
};
export default function NovaActLog({ logs }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`log-panel ${open ? 'log-panel--open' : ''}`}>
      <button className="log-bar" onClick={() => setOpen(o => !o)}>
        <span className="log-live" />
        <span>AI AGENT LOG</span>
        <span className="log-count">{logs.length}</span>
        <span className="log-chevron">{open ? '▼' : '▲'}</span>
      </button>
      {open && (
        <div className="log-body">
          {!logs.length && <div className="log-empty">_ Waiting for agent activity...</div>}
          {logs.map(l => (
            <div key={l.id} className="log-line">
              <span className="log-ts">{l.ts}</span>
              <span className="log-pre" style={{ color: TYPE[l.type]?.color }}>{TYPE[l.type]?.pre}</span>
              <span className="log-msg" style={{ color: TYPE[l.type]?.color }}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}