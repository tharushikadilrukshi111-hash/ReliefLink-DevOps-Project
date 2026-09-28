import React from 'react';
import { Icon } from './Icons';
import { navItems } from '../data/mockData';

export default function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Icon name="shield" size={21} /></div>
          <div><strong>Responza</strong><span>Disaster Command</span></div>
          <button className="icon-btn sidebar-close" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="command-status">
          <span className="live-dot" />
          <div><strong>National Operations</strong><span>System operational</span></div>
        </div>

        <nav className="nav-list">
          <p className="nav-label">Command centre</p>
          {navItems.map(([key, label]) => (
            <button key={key} className={active === key ? 'active' : ''} onClick={() => { onNavigate(key); onClose(); }}>
              <Icon name={key} />
              <span>{label}</span>
              {key === 'incidents' && <em>6</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="emergency-card">
            <div className="emergency-icon"><Icon name="phone" /></div>
            <div><small>Emergency hotline</small><strong>117</strong><span>24/7 Disaster Management Centre</span></div>
          </div>
          <div className="profile-mini">
            <div className="avatar">AD</div>
            <div><strong>Admin Operator</strong><span>National Control Room</span></div>
            <button className="icon-btn"><Icon name="chevron" size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
