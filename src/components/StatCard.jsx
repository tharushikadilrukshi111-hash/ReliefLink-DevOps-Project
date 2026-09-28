import React from 'react';
import { Icon } from './Icons';

export default function StatCard({ label, value, note, icon, trend, tone }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-head"><span className="stat-icon"><Icon name={icon}/></span><span className={`trend ${trend?.startsWith('+') ? 'up' : ''}`}>{trend}</span></div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-label">{label}</span>
      <small>{note}</small>
    </article>
  );
}
