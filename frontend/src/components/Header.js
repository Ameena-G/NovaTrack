import './Header.css';
export default function Header({ view, setView, alertCount, user, onSignOut }) {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-hex">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 6.5v9L11 20l8-4.5v-9L11 2z" stroke="#38bdf8" strokeWidth="1.4" fill="none"/>
              <path d="M3 6.5l8 4.5 8-4.5M11 11v9" stroke="#38bdf8" strokeWidth="1.4"/>
            </svg>
          </div>
          <div>
            <div className="logo-name">Nova<em>Track</em></div>
            <div className="logo-sub">Amazon Nova Act</div>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-btn ${view === 'tracker' ? 'active' : ''}`} onClick={() => setView('tracker')}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
            Dashboard
          </button>
          <button className={`nav-btn ${view === 'alerts' ? 'active' : ''}`} onClick={() => setView('alerts')}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1a4 4 0 014 4v3l1 2H2l1-2V5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 10.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4"/></svg>
            Alerts
            {alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
          </button>
        </nav>

        <div className="header-user">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <button className="signout-btn" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </div>
    </header>
  );
}