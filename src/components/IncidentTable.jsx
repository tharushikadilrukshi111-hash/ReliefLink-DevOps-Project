import React, { useMemo, useState } from 'react';
import { incidents as initialIncidents } from '../data/mockData';
import { Icon } from './Icons';

export default function IncidentTable({ search = '' }) {
  const [filter, setFilter] = useState('All');
  const [rows, setRows] = useState(initialIncidents);
  const filters = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const visible = useMemo(() => rows.filter(r => (filter === 'All' || r.severity === filter) && `${r.id} ${r.district} ${r.type} ${r.status}`.toLowerCase().includes(search.toLowerCase())), [rows, filter, search]);

  function cycleStatus(id) {
    const statuses = ['Assessing', 'Monitoring', 'Evacuating', 'Responding', 'Resolved'];
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: statuses[(statuses.indexOf(r.status) + 1) % statuses.length] } : r));
  }

  return (
    <section className="panel incidents-panel">
      <div className="panel-header table-header">
        <div><span className="eyebrow">Operations</span><h2>Active incidents</h2></div>
        <div className="filter-row"><Icon name="filter" size={17}/>{filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Incident</th><th>Location</th><th>Severity</th><th>People</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            {visible.map(row => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong><span>{row.type}</span></td>
                <td>{row.district}</td>
                <td><span className={`severity ${row.severity.toLowerCase()}`}>{row.severity}</span></td>
                <td>{row.people.toLocaleString()}</td>
                <td><button className="status-button" onClick={() => cycleStatus(row.id)}>{row.status}</button></td>
                <td>{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <div className="empty-state">No incidents match this search or filter.</div>}
      </div>
    </section>
  );
}
