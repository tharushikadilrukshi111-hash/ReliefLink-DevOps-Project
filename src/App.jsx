import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from './components/Icons';
import { backend, clearSession, getStoredUser, setSession } from './lib/api';
import { getSocket } from './lib/socket';
import InventoryModule from './components/modules/InventoryModule';
import VolunteersModule from './components/modules/VolunteersModule';
import FieldLogsModule from './components/modules/FieldLogsModule';
import SOSMapModule from './components/modules/SOSMapModule';

const navItems = [
  ['dashboard', 'dashboard', 'Dashboard', 'පාලක පුවරුව'],
  ['map', 'map', 'SOS Map', 'සජීවී සිතියම'],
  ['inventory', 'resources', 'Inventory & Supplies', 'සැපයුම් හා ගබඩාව'],
  ['volunteers', 'teams', 'Volunteer Hub', 'ස්වේච්ඡා බලකාය'],
  ['logs', 'reports', 'Field Logs', 'ක්ෂේත්‍ර සටහන්'],
];

const fallbackIncidents = [
  {
    id: 1, severity: 'critical', tag: 'CRITICAL RED // අතිශය හදිසි', meta: 'GPS: 6.5854° N, 79.9607° E', time: '42s ago',
    title: 'ජල මට්ටම ඉහළ යමින් පවතී — Kalutara Bridge Zone B', desc: 'Water breached second tier levee. 14 civilians awaiting boat extraction.',
    action: 'DISPATCH BOAT', icon: 'home'
  },
  {
    id: 2, severity: 'critical', tag: 'CRITICAL RED // හදිසි ප්‍රතිකාර', meta: 'GPS: 6.6828° N, 80.3992° E', time: '2m ago',
    title: 'Urgent: Oxygen Cylinder Depletion — Ratnapura Base Clinic', desc: 'ඔක්සිජන් සිලින්ඩර් අවසන් වෙමින් පවතී. Airlift requested.',
    action: 'AIRLIFT CYLINDERS', icon: 'plus'
  },
  {
    id: 3, severity: 'amber', tag: 'AMBER CAUTION // අවධානයට', meta: 'A4 Highway km 78', time: '4m ago',
    title: 'නායයාම නිසා මාර්ගය අවහිර වීම — Beruwala Mountain Access', desc: 'Debris blocking both inbound lanes. Convoy route recalculation required.',
    action: 'REROUTE CONVOY', icon: 'map'
  },
  {
    id: 4, severity: 'amber', tag: 'AMBER CAUTION // විදුලි බිඳවැටීම', meta: 'Matara Sector 3 Shelter', time: '7m ago',
    title: 'Substation Grid Trip — 820 Civilians In Darkness', desc: 'Emergency floodlights deployed via mobile field generators.',
    action: 'DISPATCH POWER GEN', icon: 'pulse'
  },
];

const quickActions = [
  { title: 'Drone Medical Airlift', sub: 'ඩ්‍රෝන මඟින් බෙහෙත් සැපයීම (4 Kits Standby)', tone: 'blue', icon: 'truck' },
  { title: 'Amphibious Fleet Launch', sub: 'ජල ගැලීම් මුදාගැනීමේ යාත්‍රා (12 Units Live)', tone: 'green', icon: 'home' },
  { title: 'Shelter Evac Broadcast', sub: 'ආරක්ෂිත කඳවුරු දැනුම්දීම් SMS / Push', tone: 'red', icon: 'alerts' },
  { title: 'Open Tactical Radio Patch', sub: 'සන්නිවේදන තරංග විවෘත කිරීම (CH-14 VHF)', tone: 'blue', icon: 'reports' },
];

const fallbackReadiness = [
  ['Navy SBS Rescue Battalion 04', 88, 'ASSIGNED', 'green'],
  ['Red Cross First Aid Mobile Clinics', 94, 'DEPLOYED', 'blue'],
  ['Civil Volunteer Transport Boats', 62, 'CAPACITY', 'red'],
];

function MiniMap({ variant = 0 }) {
  return (
    <div className={`mini-map-art map-v${variant}`} aria-label="Sri Lanka disaster map preview">
      <svg viewBox="0 0 320 130" role="img" aria-hidden="true">
        <rect width="320" height="130" fill="#dce9d8" />
        <path d="M0 18h320M0 56h320M0 96h320" stroke="#c7d8c4" strokeWidth="1" opacity=".6" />
        <path d="M25 130C62 88 84 75 113 58c30-18 43-28 67-58" fill="none" stroke="#fff" strokeWidth="10" />
        <path d="M25 130C62 88 84 75 113 58c30-18 43-28 67-58" fill="none" stroke="#ea8598" strokeWidth="3" />
        <path d="M91 130c6-30 18-49 44-75 27-27 62-37 98-50" fill="none" stroke="#fff" strokeWidth="8" />
        <path d="M91 130c6-30 18-49 44-75 27-27 62-37 98-50" fill="none" stroke="#8fb9d5" strokeWidth="2" />
        <path d="M0 105c47-7 87-6 125 0 42 6 78 9 118-2 31-9 50-23 77-46v73H0z" fill="#87d6e4" opacity=".78" />
        <circle cx={variant === 1 ? 173 : variant === 2 ? 232 : 108} cy={variant === 1 ? 69 : variant === 2 ? 39 : 80} r="7" fill="#ff4f49" stroke="#fff" strokeWidth="3" />
        <circle cx={variant === 1 ? 173 : variant === 2 ? 232 : 108} cy={variant === 1 ? 69 : variant === 2 ? 39 : 80} r="15" fill="none" stroke="#ff4f49" strokeWidth="2" opacity=".35" />
        <g fill="#6f8a73" fontSize="8" fontFamily="Arial">
          <text x="16" y="20">Galle</text><text x="145" y="28">Kalutara</text><text x="221" y="77">Ratnapura</text><text x="86" y="109">Matara</text>
        </g>
      </svg>
    </div>
  );
}

function LiveCameraArt() {
  return (
    <div className="live-cam-art">
      <svg viewBox="0 0 360 180" aria-hidden="true">
        <defs>
          <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#06242f"/><stop offset="1" stopColor="#02070c"/></linearGradient>
          <radialGradient id="glow"><stop stopColor="#41efff" stopOpacity=".92"/><stop offset="1" stopColor="#41efff" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="360" height="180" fill="url(#night)"/>
        <circle cx="180" cy="55" r="78" fill="url(#glow)" opacity=".35"/>
        <path d="M0 132c55-14 89 12 137 0 56-14 102 8 151-2 29-6 48-5 72 2v48H0z" fill="#0b3541"/>
        <path d="M67 123c35-12 81-19 128-16 46 2 81 12 104 28-35 21-79 30-139 28-50-2-82-15-93-40z" fill="#161b1f" stroke="#60666c" strokeWidth="3"/>
        <path d="M101 115h145l-16 34H118z" fill="#1c2529"/>
        <g fill="#ff483f"><circle cx="141" cy="90" r="10"/><circle cx="181" cy="83" r="10"/><circle cx="222" cy="92" r="10"/></g>
        <g fill="#071013"><rect x="134" y="99" width="14" height="35" rx="7"/><rect x="174" y="92" width="14" height="39" rx="7"/><rect x="215" y="101" width="14" height="33" rx="7"/></g>
        <circle cx="179" cy="50" r="10" fill="#68f4ff"/><circle cx="179" cy="50" r="42" fill="url(#glow)" opacity=".65"/>
      </svg>
      <span className="cam-scan" />
    </div>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return <div className="cb-toast"><span className="status-dot green" />{text}</div>;
}

function ConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="confirm-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="danger-symbol">!</div>
        <span className="eyebrow red">EMERGENCY CONTROL</span>
        <h2>Trigger national SOS protocol?</h2>
        <p>This demo frontend will simulate activating the Level 4 SOS workflow and update the dashboard state.</p>
        <div className="modal-actions"><button className="soft-button" onClick={onClose}>CANCEL</button><button className="danger-button" onClick={onConfirm}>CONFIRM SOS</button></div>
      </div>
    </div>
  );
}

function PlaceholderView({ active, onBack }) {
  const item = navItems.find(n => n[0] === active);
  return (
    <main className="placeholder-view">
      <div className="placeholder-orbit"><Icon name={item?.[1] || 'dashboard'} size={42}/></div>
      <div className="eyebrow green">CRISISBRIDGE MODULE</div>
      <h1>{item?.[2]}</h1>
      <p>{item?.[3]}</p>
      <p className="placeholder-copy">This screen is wired as a functional frontend module. The supplied Figma file contains the full visual specification for the Operator Dashboard, so the dashboard remains the pixel-matched primary screen.</p>
      <button className="broadcast-button" onClick={onBack}>RETURN TO DASHBOARD</button>
    </main>
  );
}

function formatRelativeTime(value) {
  if (!value) return 'now';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function LoginScreen({ onLogin, backendState }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try { await onLogin(username, password); }
    catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  }
  return <div className="login-page">
    <div className="login-card">
      <div className="login-brand"><div className="brand-mark"><span className="brand-wave">⌁</span><span className="brand-alert">●</span></div><div><strong>CRISISBRIDGE</strong><small>DISASTER RELIEF HQ</small></div></div>
      <span className="module-eyebrow">SECURE OPERATOR ACCESS</span>
      <h1>Command Console Login</h1>
      <p>Sign in to access the MySQL-backed response system and real-time dispatch channel.</p>
      <div className={`backend-indicator ${backendState === 'online' ? 'online' : 'offline'}`}><i/>{backendState === 'online' ? 'API + MYSQL ONLINE' : backendState === 'checking' ? 'CHECKING LOCAL BACKEND...' : 'BACKEND OFFLINE — SEE SETUP GUIDE'}</div>
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username"/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
        {error && <div className="login-error">{error}</div>}
        <button className="module-primary login-submit" disabled={loading || backendState === 'offline'}>{loading ? 'AUTHENTICATING...' : 'ENTER COMMAND CONSOLE'}</button>
      </form>
      <div className="demo-credentials"><b>Local demo:</b> admin / admin123</div>
    </div>
  </div>;
}

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [language, setLanguage] = useState('EN');
  const [filter, setFilter] = useState('critical');
  const [toast, setToast] = useState('');
  const [sosOpen, setSosOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [countdown, setCountdown] = useState(5680);
  const [user, setUser] = useState(getStoredUser());
  const [backendState, setBackendState] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [incidents, setIncidents] = useState(fallbackIncidents);
  const [metrics, setMetrics] = useState({ distress_beacons:1248, safe_civilians:18920, mobile_units:412, mesh_latency_ms:3.2, mesh_nodes:1420, websocket_latency_ms:4, packet_loss:0, radio_band:'BAND 14 LMR', radio_frequency:'782.4 MHz' });
  const [counts, setCounts] = useState({ open_incidents:148, critical_incidents:24, medical_incidents:41 });
  const [units, setUnits] = useState(fallbackReadiness.map(([name,readiness_percent,status],id)=>({id:id+1,name,readiness_percent,status})));
  const [inventory, setInventory] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [logs, setLogs] = useState([]);

  function flash(message) { setToast(message); }

  useEffect(() => {
    backend.health().then(()=>setBackendState('online')).catch(()=>setBackendState('offline'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function refreshCore() {
    if (!user) return;
    try {
      const [summary, incidentRows] = await Promise.all([backend.summary(), backend.incidents('all')]);
      if (summary.metrics) {
        setMetrics(summary.metrics);
        if (summary.metrics.tidal_crest_seconds != null) setCountdown(Number(summary.metrics.tidal_crest_seconds));
      }
      setCounts(summary.counts || counts);
      setUnits(summary.units || []);
      setIncidents(incidentRows);
    } catch (error) {
      if (error.status === 401) { clearSession(); setUser(null); }
      else flash(`API error: ${error.message}`);
    }
  }

  async function refreshModuleData() {
    if (!user) return;
    try {
      const [stock, people, fieldLogs] = await Promise.all([backend.inventory(), backend.volunteers(), backend.logs()]);
      setInventory(stock); setVolunteers(people); setLogs(fieldLogs);
    } catch (error) { if (error.status !== 401) flash(`Module data error: ${error.message}`); }
  }

  useEffect(() => { if (user) { refreshCore(); refreshModuleData(); } }, [user]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const reloadCore = () => refreshCore();
    const reloadModules = () => refreshModuleData();
    socket.on('incident:new', reloadCore); socket.on('incident:update', reloadCore); socket.on('dispatch:new', reloadCore);
    socket.on('inventory:update', reloadModules); socket.on('inventory:delete', reloadModules);
    socket.on('volunteer:update', reloadModules); socket.on('volunteer:delete', reloadModules); socket.on('fieldlog:new', reloadModules);
    socket.on('unit:update', reloadCore);
    socket.on('alert:update', payload => { if (payload.type === 'sos') setSosActive(Boolean(payload.active)); if (payload.type === 'siren') setBroadcasting(Boolean(payload.active)); flash(payload.message); });
    return () => {
      socket.off('incident:new', reloadCore); socket.off('incident:update', reloadCore); socket.off('dispatch:new', reloadCore);
      socket.off('inventory:update', reloadModules); socket.off('inventory:delete', reloadModules);
      socket.off('volunteer:update', reloadModules); socket.off('volunteer:delete', reloadModules); socket.off('fieldlog:new', reloadModules);
      socket.off('unit:update', reloadCore); socket.off('alert:update');
    };
  }, [user]);

  const time = useMemo(() => {
    const h = String(Math.floor(countdown / 3600)).padStart(2, '0');
    const m = String(Math.floor((countdown % 3600) / 60)).padStart(2, '0');
    const s = String(countdown % 60).padStart(2, '0');
    return [h, m, s];
  }, [countdown]);

  const visibleIncidents = useMemo(() => {
    if (filter === 'all') return incidents;
    if (filter === 'medical') return incidents.filter(x => x.category === 'medical' || x.severity === 'medical');
    return incidents.filter(x => x.severity === 'critical');
  }, [incidents, filter]);

  async function login(username, password) {
    const result = await backend.login(username, password);
    setSession(result.token, result.user); setUser(result.user); setBackendState('online');
  }
  function logout(){ clearSession(); setUser(null); setActive('dashboard'); }

  async function guarded(task) {
    setBusy(true);
    try { return await task(); }
    catch (error) { flash(error.message); throw error; }
    finally { setBusy(false); }
  }

  async function runDispatch(label, incidentId) {
    await guarded(async()=>{
      if (incidentId) await backend.dispatchIncident(incidentId, label); else await backend.quickAction(label);
      flash(`${label} command acknowledged • stored in MySQL`);
      await refreshCore();
    }).catch(()=>{});
  }

  async function createIncident(payload){ await guarded(()=>backend.createIncident(payload)); await refreshCore(); flash('Incident created and broadcast in real time.'); }
  async function changeIncidentStatus(id,status){ await guarded(()=>backend.updateIncidentStatus(id,status)); await refreshCore(); }
  async function createInventory(payload){ await guarded(()=>backend.createInventory(payload)); await refreshModuleData(); flash('Inventory item saved.'); }
  async function updateInventory(id,payload){ await guarded(()=>backend.updateInventory(id,payload)); await refreshModuleData(); }
  async function deleteInventory(id){ if(!confirm('Delete this inventory record?'))return; await guarded(()=>backend.deleteInventory(id)); await refreshModuleData(); }
  async function createVolunteer(payload){ await guarded(()=>backend.createVolunteer(payload)); await refreshModuleData(); flash('Volunteer registered.'); }
  async function updateVolunteer(id,payload){ await guarded(()=>backend.updateVolunteer(id,payload)); await refreshModuleData(); }
  async function deleteVolunteer(id){ if(!confirm('Delete this volunteer record?'))return; await guarded(()=>backend.deleteVolunteer(id)); await refreshModuleData(); }
  async function createLog(payload){ await guarded(()=>backend.createLog(payload)); await refreshModuleData(); flash('Field log published.'); }
  async function toggleSiren(){ const next=!broadcasting; await guarded(()=>backend.siren(next)).catch(()=>{}); setBroadcasting(next); }
  async function confirmSOS(){ setSosOpen(false); await guarded(()=>backend.sos(true)).catch(()=>{}); setSosActive(true); }

  if (!user) return <LoginScreen onLogin={login} backendState={backendState}/>;

  return (
    <div className="page-bg">
      <div className="crisis-stage">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark"><span className="brand-wave">⌁</span><span className="brand-alert">●</span></div>
            <div><strong>CRISISBRIDGE</strong><small>DISASTER RELIEF HQ</small></div>
          </div>
          <div className="nav-label">TACTICAL SYSTEMS / පද්ධති</div>
          <nav className="sidebar-nav">
            {navItems.map(([key, icon, label, sub]) => (
              <button key={key} className={`nav-link ${active === key ? 'active' : ''}`} onClick={() => setActive(key)}>
                <span className="nav-icon"><Icon name={icon} size={18}/></span>
                <span className="nav-copy"><b>{label}</b><small>{sub}</small></span>
                {key === 'dashboard' && <span className="nav-online"/>}
              </button>
            ))}
          </nav>
          <div className="telemetry-panel">
            <div className="telemetry-head"><span>RADIO TELEMETRY</span><i/></div>
            <div><span>{metrics.radio_band || 'BAND 14 LMR'}</span><b>{metrics.radio_frequency || '782.4 MHz'}</b></div>
            <div><span>PACKET LOSS</span><b>{Number(metrics.packet_loss || 0).toFixed(2)}%</b></div>
            <div><span>LATENCY</span><b className="latency">{Number(metrics.websocket_latency_ms || 4).toFixed(0)}ms SYNCED</b></div>
          </div>
        </aside>

        <section className="main-column">
          <header className="topbar">
            <div className="top-status">
              <div className="threat-pill"><i/><span><b>ACTIVE LEVEL 4</b><small>CYCLONE</small></span><em>| SECTOR-<br/>07</em></div>
              <div className="network-pill">
                <span><i/>WS: <b>CONNECTED</b><small>{Number(metrics.websocket_latency_ms || 4).toFixed(0)}ms</small></span><em>•</em>
                <span><i/>SAT-LINK: <b>LOCK</b><small>99.9%</small></span><em>•</em>
                <span><i/>MESH NODES: <b>{Number(metrics.mesh_nodes || 1420).toLocaleString()}</b><small>ONLINE</small></span>
              </div>
            </div>
            <div className="top-actions">
              <div className="lang-toggle"><button className={language === 'EN' ? 'active' : ''} onClick={() => setLanguage('EN')}>EN</button><button className={language === 'SI' ? 'active' : ''} onClick={() => setLanguage('SI')}>සිං</button></div>
              <button className={`sos-button ${sosActive ? 'active' : ''}`} onClick={() => setSosOpen(true)}><Icon name="incidents" size={17}/><span>{sosActive ? 'SOS ACTIVE' : 'SOS TRIGGER'}</span></button>
              <button className="profile-button" title={`${user.fullName || user.username} — click to logout`} onClick={logout}><span className="profile-face">👩🏽‍🚒</span><i/></button>
            </div>
          </header>

          {active === 'map' ? <SOSMapModule incidents={incidents} onCreate={createIncident} onStatus={changeIncidentStatus} busy={busy}/> : active === 'inventory' ? <InventoryModule items={inventory} onCreate={createInventory} onUpdate={updateInventory} onDelete={deleteInventory} busy={busy}/> : active === 'volunteers' ? <VolunteersModule volunteers={volunteers} onCreate={createVolunteer} onUpdate={updateVolunteer} onDelete={deleteVolunteer} busy={busy}/> : active === 'logs' ? <FieldLogsModule logs={logs} onCreate={createLog} busy={busy}/> : (
          <main className="dashboard-main">
            <section className="critical-banner">
              <div className="banner-glow" />
              <div className="banner-left">
                <div className="alarm-circle"><Icon name="alerts" size={24}/></div>
                <div className="banner-copy">
                  <div className="alert-meta"><span>CRITICAL ALERT // හදිසි අනතුර</span><b>CODE: FL-8802 • SECTOR-07</b></div>
                  <h1>Flash Flood &amp; Coastal Surge — Southern Maritime Corridor</h1>
                  <p>ගංවතුර හා මුහුදු රළ ඉහළ යාමේ අනතුරු ඇඟවීමයි. දකුණු මුහුදු තීරයේ සියලුම<br/>මුදවාගැනීමේ කණ්ඩායම් සුදානමින් සිටින්න.</p>
                </div>
              </div>
              <div className="countdown-box">
                <div className="countdown-copy"><span>TIDAL SURGE CREST IN</span><div className="timer"><b>{time[0]}</b><i>:</i><b>{time[1]}</b><i>:</i><b className="seconds">{time[2]}</b></div></div>
                <span className="vertical-divider"/>
                <button className={`broadcast-button ${broadcasting ? 'broadcasting' : ''}`} onClick={toggleSiren}><Icon name="alerts" size={16}/>{broadcasting ? 'BROADCASTING...' : 'SIREN BROADCAST'}</button>
              </div>
            </section>

            <section className="metrics-grid">
              <article className="metric-card red-card">
                <div className="metric-glow"/><div className="metric-kicker"><span><i/>LIVE TELEMETRY //<br/>හදිසි</span><Icon name="pulse" size={17}/></div>
                <strong className="metric-number">{Number(metrics.distress_beacons || 0).toLocaleString()}</strong>
                <div className="metric-label"><span>Active Distress<br/>Beacons</span><b>+14 in<br/>last 5m</b></div>
                <small>සක්‍රීය හදිසි ඇමතුම් සංඥා</small>
                <div className="sparkline red-line"><svg viewBox="0 0 165 48"><path d="M1 41C22 44 28 34 49 32c20-2 25 10 45 2 23-10 22-28 42-23 13 4 14 25 28 19" fill="none" stroke="currentColor" strokeWidth="2.3"/><circle cx="164" cy="30" r="3" fill="currentColor"/></svg></div>
              </article>
              <article className="metric-card green-card">
                <div className="metric-glow"/><div className="metric-kicker"><span><i/>RESCUE TO DATE //<br/>සුරක්ෂිත</span><Icon name="shield" size={17}/></div>
                <strong className="metric-number">{Number(metrics.safe_civilians || 0).toLocaleString()}</strong>
                <div className="metric-label"><span>Safe Civilians<br/>Logged</span><b>+240 /<br/>hr</b></div>
                <small>බේරාගත් පුද්ගලයින්ගේ එකතුව</small>
                <div className="sparkline"><svg viewBox="0 0 165 48"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00d9a0" stopOpacity=".45"/><stop offset="1" stopColor="#00d9a0" stopOpacity="0"/></linearGradient></defs><path d="M1 42C30 34 47 31 67 29c26-3 38 0 57-10 16-9 26-12 40-10V48H1z" fill="url(#sg)"/><path d="M1 42C30 34 47 31 67 29c26-3 38 0 57-10 16-9 26-12 40-10" fill="none" stroke="currentColor" strokeWidth="2.3"/><circle cx="164" cy="9" r="3" fill="currentColor"/></svg></div>
              </article>
              <article className="metric-card blue-card">
                <div className="metric-glow"/><div className="metric-kicker"><span><i/>ASSETS DISPATCHED //<br/>මෙහෙයුම්</span><Icon name="truck" size={17}/></div>
                <strong className="metric-number">{Number(metrics.mobile_units || 0).toLocaleString()}</strong>
                <div className="metric-label"><span>In-Field<br/>Mobile Units</span><b>96.8%<br/>Operational</b></div>
                <small>සක්‍රීය මෙහෙයුම් කණ්ඩායම්</small>
                <div className="asset-pills"><span>✈ Drone Fleet <b>148</b></span><span>♒ Amphibious <b>64</b></span></div>
              </article>
              <article className="metric-card mesh-card">
                <div className="metric-glow"/><div className="metric-kicker"><span><i/>SOCKET CLUSTER //<br/>TELEMETRY</span><Icon name="teams" size={17}/></div>
                <div className="latency-number"><strong>{Number(metrics.mesh_latency_ms || 0).toFixed(1)}</strong><span>ms</span></div>
                <div className="metric-label"><span>Global Mesh<br/>Latency</span><b>SYNCED</b></div>
                <small>අධිවේගී දත්ත සන්නිවේදනය</small>
                <div className="bar-visual">{[16,29,38,22,35,28,39].map((h,i)=><i key={i} style={{height:h}}/>)}</div>
              </article>
            </section>

            <section className="operations-grid">
              <div className="primary-column">
                <article className="sos-feed-card">
                  <div className="feed-header">
                    <h2>Real-Time Inbound<br/>SOS Feed</h2>
                    <div className="feed-filters">
                      <span className="buffer-pill">12 SEC<br/>BUFFER</span>
                      <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>ALL<br/>({Number(counts.open_incidents || incidents.length)})</button>
                      <button className={`critical ${filter==='critical'?'active':''}`} onClick={()=>setFilter('critical')}>CRITICAL<br/>ONLY ({Number(counts.critical_incidents || 0)})</button>
                      <button className={filter==='medical'?'active':''} onClick={()=>setFilter('medical')}>MEDICAL<br/>({Number(counts.medical_incidents || 0)})</button>
                    </div>
                  </div>
                  <div className="incident-list">
                    {visibleIncidents.map((incident) => (
                      <div className={`incident-row ${incident.severity}`} key={incident.id}>
                        <div className="incident-icon"><Icon name={incident.icon} size={18}/></div>
                        <div className="incident-copy">
                          <div className="incident-tag">{incident.tag}</div>
                          <div className="incident-meta"><b>{incident.meta}</b><span>• {incident.time || formatRelativeTime(incident.createdAt)}</span></div>
                          <h3>{incident.title}</h3>
                          <p>{incident.desc}</p>
                        </div>
                        <div className="incident-action"><button onClick={() => runDispatch(incident.action, incident.id)}>{incident.action}</button><button className="more-button" onClick={()=>changeIncidentStatus(incident.id, incident.status === 'resolved' ? 'open' : 'resolved')} title="Toggle resolved">⋮</button></div>
                      </div>
                    ))}
                    {visibleIncidents.length === 0 && <div className="empty-feed">No matching SOS packets in the current buffer.</div>}
                  </div>
                </article>

                <div className="radar-strip">
                  <article className="radar-card"><div className="radar-kicker blue">MARITIME RADAR <i/></div><h3>Galle Harbor Sector</h3><p>Wave swell: 4.8m. Offshore<br/>rescue cut-off approaching.</p><MiniMap variant={0}/></article>
                  <article className="radar-card"><div className="radar-kicker red">RIVER BASIN SENSOR <i/></div><h3>Kalu Ganga<br/>Hydrology</h3><p>Danger Level: EXCEEDED<br/>by 1.4m at Putupaula station.</p><MiniMap variant={1}/></article>
                  <article className="radar-card"><div className="radar-kicker green">RELIEF AIR CORRIDOR <i/></div><h3>Ratnapura Heli-Pad</h3><p>Visibility: 850m. Rotor<br/>clearance active for 12 heavy UAVs.</p><MiniMap variant={2}/></article>
                </div>
              </div>

              <aside className="tactical-column">
                <article className="quick-card">
                  <div className="quick-head"><h2><span>ϟ</span> Quick<br/>Dispatch<br/>Actions</h2><span className="authorized">LVL 4<br/>AUTHORIZED</span></div>
                  <p className="quick-desc">One-touch execution with automated telemetry lock and live GPS beacon tracking.</p>
                  <div className="quick-list">
                    {quickActions.map((a) => <button className="quick-action" key={a.title} onClick={() => runDispatch(a.title)}><span className={`quick-icon ${a.tone}`}><Icon name={a.icon} size={17}/></span><span className="quick-text"><b>{a.title}</b><small>{a.sub}</small></span><span className="quick-ready"/><span className="quick-arrow">›</span></button>)}
                  </div>
                </article>

                <article className="readiness-card">
                  <div className="readiness-head"><h2>Active Unit<br/>Readiness</h2><span className="barcode">▥▥▥▥<br/>▥▥▥▥</span></div>
                  <div className="readiness-list">
                    {units.map((unit,index) => { const tone=index===0?'green':index===1?'blue':'red'; const pct=Number(unit.readiness_percent ?? unit.readinessPercent ?? 0); return <div className="readiness-row" key={unit.id || unit.name}><div><span>{unit.name}</span><b className={tone}>{pct}%<small>{unit.status}</small></b></div><div className="progress"><i className={tone} style={{width:`${pct}%`}}/></div></div>})}
                  </div>
                  <div className="live-cam"><LiveCameraArt/><div className="cam-meta"><span>LIVE CAM // UNIT-408<br/>KALUTARA</span><b><i/>24 FPS<br/>H.265</b></div></div>
                </article>
              </aside>
            </section>
          </main>)}
        </section>
      </div>
      <Toast text={toast}/>
      <ConfirmModal open={sosOpen} onClose={() => setSosOpen(false)} onConfirm={confirmSOS}/>
    </div>
  );
}
