import React from 'react';
import { Icon } from './Icons';

export default function Header({ onMenu, onReport, dark, setDark, search, setSearch }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-btn" onClick={onMenu}><Icon name="menu" /></button>
        <div className="searchbox">
          <Icon name="search" size={18}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents, shelters, teams..." />
          <kbd>⌘ K</kbd>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="weather-pill"><span>Galle</span><strong>27°C</strong><small>Heavy rain</small></div>
        <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme"><Icon name={dark ? 'sun' : 'moon'} /></button>
        <button className="icon-btn notification"><Icon name="bell"/><span>3</span></button>
        <button className="primary-btn" onClick={onReport}><Icon name="plus" size={18}/>New incident</button>
      </div>
    </header>
  );
}
