import { useState, useEffect, useRef } from 'react';

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, duration = 1800, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  const elRef = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ref.current) {
        ref.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (elRef.current) obs.observe(elRef.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={elRef}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Marquee ticker ────────────────────────────────────────────────────────────
const TICKERS = [
  { sym: 'AMZN', val: '₹189,240', chg: '+2.4%', up: true },
  { sym: 'FLIP',  val: '₹67,999',  chg: '-1.8%', up: false },
  { sym: 'CROMA', val: '₹54,490',  chg: '+0.9%', up: true },
  { sym: 'MEESH', val: '₹12,999',  chg: '+3.1%', up: true },
  { sym: 'AMZN',  val: '₹21,999',  chg: '-0.5%', up: false },
  { sym: 'FLIP',  val: '₹99,990',  chg: '+1.2%', up: true },
  { sym: 'CROMA', val: '₹149,900', chg: '-2.0%', up: false },
  { sym: 'MEESH', val: '₹8,499',   chg: '+4.3%', up: true },
];

function PriceTicker() {
  const items = [...TICKERS, ...TICKERS];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(45,212,191,0.1)', borderBottom: '1px solid rgba(45,212,191,0.1)', background: 'rgba(6,13,13,0.9)', height: 38, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', gap: 0, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap' }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 32px', borderRight: '1px solid rgba(45,212,191,0.07)' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4d7a72', letterSpacing: '0.15em' }}>{t.sym}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#c8e8e0', fontWeight: 500 }}>{t.val}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: t.up ? '#2dd4bf' : '#f87171', fontWeight: 600 }}>{t.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Canvas aurora ─────────────────────────────────────────────────────────────
function AuroraCanvas() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight, raf;
    let t = 0;
    const orbs = [
      { x: 0.15, y: 0.3,  r: 0.45, hue: 175, speed: 0.0003 },
      { x: 0.82, y: 0.6,  r: 0.38, hue: 190, speed: 0.0004 },
      { x: 0.5,  y: 0.85, r: 0.42, hue: 160, speed: 0.00025 },
    ];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 1;
      orbs.forEach(o => {
        const cx = (o.x + Math.sin(t * o.speed * 60) * 0.08) * W;
        const cy = (o.y + Math.cos(t * o.speed * 45) * 0.07) * H;
        const r = o.r * Math.min(W, H);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `hsla(${o.hue},70%,45%,0.12)`);
        g.addColorStop(0.5, `hsla(${o.hue},60%,35%,0.05)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.9 }} />;
}

// ── Floating price card ───────────────────────────────────────────────────────
function FloatingCard({ top, left, right, delay, product, store, price, drop, animY }) {
  return (
    <div style={{ position: 'absolute', top, left, right, zIndex: 3, animation: `floatCard 6s ease-in-out ${delay} infinite`, pointerEvents: 'none' }}>
      <div style={{ background: 'rgba(8,24,22,0.92)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,191,0.05)', minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#2dd4bf', letterSpacing: '0.15em' }}>{store}</span>
          <span style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>↓ {drop}</span>
        </div>
        <div style={{ fontSize: 12, color: '#8ab5ae', marginBottom: 6, lineHeight: 1.4, fontFamily: "'Instrument Serif', serif" }}>{product}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: '#e2f0ee' }}>{price}</div>
        <div style={{ marginTop: 8, height: 2, background: 'rgba(45,212,191,0.1)', borderRadius: 1 }}>
          <div style={{ height: '100%', width: drop, background: 'linear-gradient(90deg, #2dd4bf, #5eead4)', borderRadius: 1, boxShadow: '0 0 8px rgba(45,212,191,0.5)' }} />
        </div>
      </div>
    </div>
  );
}

// ── Step icon SVGs ────────────────────────────────────────────────────────────
const TargetIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="13" cy="13" r="11" stroke="#2dd4bf" strokeWidth="1.4"/>
    <circle cx="13" cy="13" r="6" stroke="#2dd4bf" strokeWidth="1.4"/>
    <circle cx="13" cy="13" r="2" fill="#2dd4bf"/>
    <line x1="13" y1="2" x2="13" y2="6" stroke="#2dd4bf" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="13" y1="20" x2="13" y2="24" stroke="#2dd4bf" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="2" y1="13" x2="6" y2="13" stroke="#2dd4bf" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="20" y1="13" x2="24" y2="13" stroke="#2dd4bf" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const ScanIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="#2dd4bf" strokeWidth="1.4"/>
    <rect x="15" y="3" width="8" height="8" rx="2" stroke="#2dd4bf" strokeWidth="1.4" opacity="0.5"/>
    <rect x="3" y="15" width="8" height="8" rx="2" stroke="#2dd4bf" strokeWidth="1.4" opacity="0.5"/>
    <path d="M15 15h8v8h-8z" stroke="#2dd4bf" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.4"/>
    <path d="M17 19l2 2 4-4" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M13 3l2.5 6h6.5l-5.2 3.8 2 6.2L13 15.4l-5.8 3.6 2-6.2L4 9h6.5L13 3z" stroke="#2dd4bf" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="13" cy="23" r="1" fill="#2dd4bf"/>
  </svg>
);

const steps = [
  { num: '01', Icon: TargetIcon, title: 'Define your target', desc: 'Paste any product URL and set your maximum price in rupees. Works across Amazon, Flipkart, Croma, Meesho, and virtually any e-commerce site in India.' },
  { num: '02', Icon: ScanIcon,   title: 'AI monitors 24/7', desc: 'A real Chromium browser opens the page hourly. Our vision AI reads prices exactly as a human would — no broken selectors, no missed updates.' },
  { num: '03', Icon: AlertIcon,  title: 'Strike at the peak', desc: 'The instant the price hits your target, you receive a precision alert with full savings breakdown. Buy at maximum value, every single time.' },
];

const features = [
  { color: '#2dd4bf', title: 'Vision-Based Extraction', desc: 'AI reads pages visually — like a human. Redesigns, popups, and dynamic content never break the tracker.' },
  { color: '#e2b96e', title: 'Built for India ₹', desc: 'Native INR pricing. Optimised for Flipkart, Amazon IN, Croma, Meesho, and every major Indian platform.' },
  { color: '#4ade80', title: 'Hourly Automated Checks', desc: 'Set it and forget it. The agent checks every product on your list in the background — zero manual effort.' },
  { color: '#a78bfa', title: 'Live Price Dashboard', desc: 'Every tracked product, current vs target, drop percentage, and full alert history at a glance.' },
  { color: '#38bdf8', title: 'Precision Alerts', desc: 'Rich email the moment your target is hit — current price, savings amount, percentage drop, buy link.' },
  { color: '#f87171', title: 'Zero Platform Lock-in', desc: 'No vendor APIs, no restrictions. If a human can read its price, NovaTrack can track it.' },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function SignIn({ onSignIn }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = { name: name || email.split('@')[0], email };
      localStorage.setItem('nt_user', JSON.stringify(user));
      onSignIn(user);
    }, 900);
  };

  const handleGoogle = () => {
    const user = { name: 'Demo User', email: 'demo@gmail.com' };
    localStorage.setItem('nt_user', JSON.stringify(user));
    onSignIn(user);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ minHeight: '100vh', background: '#060d0d', color: '#eef2f7', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060d0d; }
        ::-webkit-scrollbar-thumb { background: rgba(45,212,191,0.3); border-radius: 2px; }
        ::selection { background: #2dd4bf; color: #060d0d; }
        input::placeholder { color: #2a4a45; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(0.5deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.15; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes heroReveal {
          0%   { opacity: 0; transform: translateY(40px) skewY(1deg); }
          100% { opacity: 1; transform: translateY(0) skewY(0deg); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); } to { transform: scaleX(1); }
        }

        .stagger-1 { animation: fadeSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.1s both; }
        .stagger-2 { animation: fadeSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .stagger-3 { animation: fadeSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.4s both; }
        .stagger-4 { animation: fadeSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.55s both; }
        .stagger-5 { animation: fadeSlideUp 0.7s cubic-bezier(.16,1,.3,1) 0.7s both; }

        .nt-step-card {
          background: rgba(8,22,20,0.7);
          border: 1px solid rgba(45,212,191,0.1);
          border-radius: 24px; padding: 40px 32px;
          position: relative; overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .nt-step-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(45,212,191,0.4), transparent);
        }
        .nt-step-card::after {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.04) 0%, transparent 70%);
          transition: opacity 0.3s;
        }
        .nt-step-card:hover { transform: translateY(-6px); border-color: rgba(45,212,191,0.28); box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(45,212,191,0.04); }
        .nt-step-card:hover::after { opacity: 1; }

        .nt-feat-card {
          background: rgba(8,22,20,0.6);
          border: 1px solid rgba(45,212,191,0.08);
          border-radius: 18px; padding: 28px 26px;
          transition: transform 0.25s ease, border-color 0.25s ease;
          cursor: default;
          position: relative; overflow: hidden;
        }
        .nt-feat-card:hover { transform: translateY(-4px); border-color: rgba(45,212,191,0.18); }

        .nt-form-input {
          width: 100%; background: rgba(6,13,13,0.8);
          border: 1px solid rgba(45,212,191,0.1);
          border-radius: 10px; padding: 13px 16px;
          color: #e2f0ee; font-size: 14px; font-weight: 300;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .nt-form-input:focus {
          border-color: #2dd4bf;
          box-shadow: 0 0 0 3px rgba(45,212,191,0.08);
        }

        .nt-btn-primary {
          background: #2dd4bf; color: #060d0d; border: none;
          padding: 15px 34px; border-radius: 10px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all 0.22s; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .nt-btn-primary:hover { background: #5eead4; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(45,212,191,0.35); }

        .nt-btn-ghost {
          background: transparent; color: #7db5ac;
          border: 1px solid rgba(45,212,191,0.18); padding: 15px 28px;
          border-radius: 10px; font-size: 14px; cursor: pointer;
          transition: all 0.22s; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .nt-btn-ghost:hover { background: rgba(45,212,191,0.06); border-color: rgba(45,212,191,0.35); color: #a7d8d0; }

        .nt-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px; background: rgba(16,40,36,0.7);
          border: 1px solid rgba(45,212,191,0.12); border-radius: 10px;
          color: #a7d8d0; font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .nt-google-btn:hover { background: rgba(22,55,50,0.9); border-color: rgba(45,212,191,0.28); transform: translateY(-1px); }

        .nt-submit-btn {
          width: 100%; padding: 14px; background: #2dd4bf; color: #060d0d;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; margin-top: 6px; margin-bottom: 18px;
          font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .nt-submit-btn:hover:not(:disabled) { background: #5eead4; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(45,212,191,0.3); }
        .nt-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 900px) {
          .nt-hero-grid { grid-template-columns: 1fr !important; }
          .nt-steps-grid { grid-template-columns: 1fr !important; }
          .nt-feat-grid { grid-template-columns: 1fr 1fr !important; }
          .nt-hero-h1 { font-size: clamp(48px, 10vw, 80px) !important; }
          .nt-stat-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .nt-feat-grid { grid-template-columns: 1fr !important; }
          .nt-stat-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Aurora background ── */}
      <AuroraCanvas />

      {/* ── Scan line effect ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.08), transparent)', animation: 'scanLine 10s linear infinite' }} />
      </div>

      {/* ── Fine grid ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(45,212,191,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.018) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,13,13,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(45,212,191,0.1)', height: 66 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L2 6v8l8 4 8-4V6L10 2z" stroke="#2dd4bf" strokeWidth="1.4"/>
                <path d="M2 6l8 4 8-4M10 10v8" stroke="#2dd4bf" strokeWidth="1.4"/>
                <circle cx="10" cy="10" r="2" fill="#2dd4bf" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400, letterSpacing: '-0.3px', lineHeight: 1 }}>
                Nova<em style={{ color: '#2dd4bf', fontStyle: 'italic' }}>Track</em>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3a5e58', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 1 }}>Price Intelligence</div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginRight: 32 }}>
            {['Features', 'How it works'].map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))} style={{ background: 'none', border: 'none', color: '#4d7a72', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#a7d8d0'} onMouseLeave={e => e.target.style.color = '#4d7a72'}>
                {l}
              </button>
            ))}
          </div>

          <button className="nt-btn-primary" style={{ padding: '10px 24px', fontSize: 13 }} onClick={() => scrollTo('signin-box')}>
            Sign In
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="#060d0d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </nav>

      {/* ── Price ticker bar ── */}
      <div style={{ marginTop: 66, position: 'relative', zIndex: 5 }}>
        <PriceTicker />
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 5, minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '60px 40px 80px', maxWidth: 1240, margin: '0 auto' }}>
        <div className="nt-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center', width: '100%' }}>

          {/* Left */}
          <div>
            <div className="stagger-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 99, padding: '8px 18px', marginBottom: 40 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', animation: 'blink 1.4s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4d7a72', letterSpacing: '2px', textTransform: 'uppercase' }}>
                AI-Powered · Real Browser · Vision-Only · ₹ India
              </span>
            </div>

            {/* Main headline — rich multi-color mix */}
            <h1 className="nt-hero-h1 stagger-2" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(52px, 6.5vw, 88px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 32 }}>
              {/* Line 1: "The" plain + "market" teal gradient */}
              <span style={{ display: 'block' }}>
                <span style={{ color: '#8ab5ae' }}>The </span>
                <span style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>market</span>
              </span>
              {/* Line 2: "moves." gold + "Your" soft white */}
              <span style={{ display: 'block' }}>
                <em style={{ color: '#e2b96e', fontStyle: 'italic' }}>moves.</em>
                <span style={{ color: '#c8ddd8' }}> Your</span>
              </span>
              {/* Line 3: "AI" violet-pink gradient + "moves" muted */}
              <span style={{ display: 'block' }}>
                <em style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>AI</em>
                <span style={{ color: '#8ab5ae' }}> moves</span>
              </span>
              {/* Line 4: "faster." cyan glow underline */}
              <span style={{ display: 'block', position: 'relative' }}>
                <em style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 60%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic', filter: 'drop-shadow(0 0 24px rgba(45,212,191,0.35))' }}>faster.</em>
                <span style={{ position: 'absolute', bottom: -8, left: 0, width: '3.4ch', height: 2, background: 'linear-gradient(90deg, #2dd4bf, #38bdf8, transparent)', animation: 'lineGrow 1s 0.8s both', transformOrigin: 'left', borderRadius: 1 }} />
              </span>
            </h1>

            <p className="stagger-3" style={{ fontSize: 17, fontWeight: 300, color: '#5a8a80', lineHeight: 1.8, maxWidth: 520, marginBottom: 44 }}>
              Intelligence that watches every price, across every platform, every hour — so the perfect deal never slips past you again.
            </p>

            <div className="stagger-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 56 }}>
              <button className="nt-btn-primary" onClick={() => scrollTo('signin-box')}>
                Get Started — It's Free
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5h11M8 2.5l5 5-5 5" stroke="#060d0d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="nt-btn-ghost" onClick={() => scrollTo('how-it-works')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5l4.5 2.5L6 10V5z" fill="currentColor"/></svg>
                See how it works
              </button>
            </div>

            {/* Social proof */}
            <div className="stagger-5" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { val: '₹4.2Cr', label: 'saved by users' },
                { val: '99.8%', label: 'uptime' },
                { val: '<3s', label: 'alert delivery' },
              ].map(s => (
                <div key={s.label} style={{ borderLeft: '2px solid rgba(45,212,191,0.2)', paddingLeft: 16 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 600, color: '#2dd4bf', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#3a5e58', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating cards */}
          <div style={{ position: 'relative', height: 480 }}>
            <FloatingCard top="0%" left="10%" product="Apple iPhone 15 128GB Blue" store="AMAZON IN" price="₹67,999" drop="12%" delay="0s" />
            <FloatingCard top="35%" right="0%" product="Sony WH-1000XM5 Wireless" store="FLIPKART" price="₹26,990" drop="18%" delay="1.5s" />
            <FloatingCard top="68%" left="0%" product="Samsung Galaxy S24 Ultra" store="CROMA" price="₹1,04,999" drop="9%" delay="3s" />

            {/* Central orb */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)', border: '1px solid rgba(45,212,191,0.2)', animation: 'pulse 3s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(45,212,191,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M13 3L3 8v10l10 5 10-5V8L13 3z" stroke="#2dd4bf" strokeWidth="1.4"/>
                  <path d="M3 8l10 5 10-5M13 13v10" stroke="#2dd4bf" strokeWidth="1.4"/>
                  <circle cx="13" cy="13" r="2.5" fill="#2dd4bf"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(45,212,191,0.08)', borderBottom: '1px solid rgba(45,212,191,0.08)', background: 'rgba(6,13,13,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="nt-stat-row" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', divideX: 'rgba(45,212,191,0.08)' }}>
          {[
            { n: 50000, suffix: '+', label: 'Products tracked' },
            { n: 98, suffix: '%', label: 'Price drop catch rate' },
            { n: 4, prefix: '₹', suffix: 'Cr+', label: 'Savings delivered' },
            { n: 1200, suffix: '+', label: 'Happy shoppers' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '36px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(45,212,191,0.06)' : 'none' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 600, lineHeight: 1, marginBottom: 8,
                background: ['linear-gradient(135deg,#2dd4bf,#38bdf8)', 'linear-gradient(135deg,#a78bfa,#f472b6)', 'linear-gradient(135deg,#e2b96e,#fb923c)', 'linear-gradient(135deg,#4ade80,#2dd4bf)'][i],
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                <Counter to={s.n} prefix={s.prefix || ''} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: '#3a5e58', fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 5, padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '3px', color: '#2dd4bf', textTransform: 'uppercase', marginBottom: 16 }}>How It Works</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(36px,4vw,60px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#e2f0ee', marginBottom: 16 }}>
            Three steps to the{' '}
            <em style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>best deal</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: '#4d7a72', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            NovaTrack handles the entire price-hunting workflow end to end — from tracking to alerting — using a real AI agent in a real browser.
          </p>
        </div>

        {/* Connector line */}
        <div className="nt-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 68, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.2), transparent)', zIndex: 0 }} />
          {steps.map((s, i) => (
            <div key={i} className="nt-step-card" style={{ animationDelay: `${i * 0.12}s` }}>
              {/* Step number */}
              <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(45,212,191,0.25)', letterSpacing: '2px' }}>{s.num}</div>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <s.Icon />
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 12, letterSpacing: '-0.3px',
                background: i === 0 ? 'linear-gradient(135deg,#2dd4bf,#38bdf8)' : i === 1 ? 'linear-gradient(135deg,#a78bfa,#f472b6)' : 'linear-gradient(135deg,#e2b96e,#fb923c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>{s.title}</div>
              <p style={{ fontSize: 14, fontWeight: 300, color: '#4d7a72', lineHeight: 1.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.1), transparent)', margin: '0 40px' }} />

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 5, padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '3px', color: '#2dd4bf', textTransform: 'uppercase', marginBottom: 16 }}>Features</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(36px,4vw,60px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#e2f0ee', marginBottom: 16 }}>
            Engineered to help you{' '}
            <em style={{ background: 'linear-gradient(135deg, #e2b96e 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>spend less</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: '#4d7a72', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Every feature is built around one goal — making sure you never pay more than you should.
          </p>
        </div>

        <div className="nt-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {features.map((f, i) => (
            <div key={i} className="nt-feat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}12`, border: `1px solid ${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, boxShadow: `0 0 8px ${f.color}` }} />
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 19, fontWeight: 400, color: f.color, marginBottom: 10, letterSpacing: '-0.2px' }}>{f.title}</div>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#4d7a72', lineHeight: 1.8 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.1), transparent)', margin: '0 40px' }} />

      {/* ── SIGN IN ── */}
      <section id="signin-box" style={{ position: 'relative', zIndex: 5, padding: '120px 40px 140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* CTA text above box */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, letterSpacing: '-1px', color: '#e2f0ee', marginBottom: 12 }}>
              Start{' '}
              <em style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>hunting</em>
              {' '}smarter
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: '#4d7a72' }}>Free forever. No credit card required.</p>
          </div>

          <div style={{ background: 'rgba(8,22,20,0.96)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 24, padding: '48px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(24px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,191,0.04)' }}>
            {/* Top gradient line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2dd4bf, #a78bfa, #e2b96e)' }} />
            {/* Glow top */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 300, height: 120, background: 'radial-gradient(ellipse, rgba(45,212,191,0.08) 0%, transparent 70%)' }} />

            {/* Mode toggle */}
            <div style={{ display: 'flex', background: 'rgba(6,13,13,0.8)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
              {['signin', 'signup'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: mode === m ? 600 : 400, transition: 'all 0.2s', background: mode === m ? 'rgba(45,212,191,0.1)' : 'transparent', color: mode === m ? '#2dd4bf' : '#3a5e58' }}>
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Google */}
            <button className="nt-google-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(45,212,191,0.07)' }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#2a4a45' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(45,212,191,0.07)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '2px', color: '#4d7a72', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Full Name</label>
                  <input className="nt-form-input" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '2px', color: '#4d7a72', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Email</label>
                <input className="nt-form-input" type="email" placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '2px', color: '#4d7a72', textTransform: 'uppercase' }}>Password</label>
                  {mode === 'signin' && <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: '#2dd4bf', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Forgot?</button>}
                </div>
                <input className="nt-form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <button className="nt-submit-btn" type="submit" disabled={loading}>
                {loading
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(6,13,13,0.3)', borderTopColor: '#060d0d', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                  : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="#060d0d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                }
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 13, color: '#3a5e58' }}>
              {mode === 'signin'
                ? <>Don't have an account? <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Sign up free</button></>
                : <>Already have an account? <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Sign in</button></>
              }
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(45,212,191,0.07)', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>
            <span style={{ color: '#e2f0ee' }}>Nova</span>
            <em style={{ background: 'linear-gradient(135deg,#2dd4bf,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>Track</em>
          </span>
          <span style={{ fontSize: 12, color: '#2a4a45', fontFamily: "'DM Mono', monospace" }}>· AI Price Intelligence</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#2a4a45', letterSpacing: '1px' }}>
          © 2025 NovaTrack · Powered by Amazon Nova AI · Built for Indian Shoppers
        </div>
      </footer>
    </div>
  );
}