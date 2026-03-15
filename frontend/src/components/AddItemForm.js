import { useState } from 'react';
import './AddItemForm.css';
export default function AddItemForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !targetPrice) return;
    onSubmit({ url, targetPrice: parseFloat(targetPrice) / 83.5, alertEmail });
  };
  return (
    <div className="form-wrap">
      <div className="nova-pill"><span className="nova-dot" />AI will browse this URL in a real Chromium session</div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Product URL</label>
          <input className="field-input" type="url" placeholder="https://books.toscrape.com/catalogue/..." value={url} onChange={e => setUrl(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Target Price (₹ Rupees)</label>
            <input className="field-input" type="number" step="1" min="0" placeholder="e.g. 3200" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Alert Email (optional)</label>
            <input className="field-input" type="email" placeholder="you@gmail.com" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
          </div>
        </div>
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? <><div className="spinner" />Browsing page...</> : '→ Start Tracking'}
        </button>
      </form>
    </div>
  );
}