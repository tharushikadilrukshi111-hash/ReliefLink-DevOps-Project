import React, { useState } from 'react';
import { Icon } from './Icons';

export default function ReportModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'Flood', district: 'Galle', severity: 'High', description: '' });
  if (!open) return null;
  const submit = e => { e.preventDefault(); onSubmit(form); onClose(); setForm({ type: 'Flood', district: 'Galle', severity: 'High', description: '' }); };
  return (
    <div className="modal-shell" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header"><div><span className="eyebrow">Field report</span><h2>Create incident</h2></div><button type="button" className="icon-btn" onClick={onClose}><Icon name="close"/></button></div>
        <div className="form-grid">
          <label>Incident type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Flood</option><option>Landslide</option><option>Strong Winds</option><option>Fire</option><option>Tsunami Warning</option></select></label>
          <label>District<select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}><option>Galle</option><option>Matara</option><option>Kalutara</option><option>Ratnapura</option><option>Kegalle</option><option>Colombo</option></select></label>
          <label>Severity<select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label className="full">Description<textarea rows="4" placeholder="Add location details, risks, access routes and immediate needs..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>
        </div>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit">Submit incident</button></div>
      </form>
    </div>
  );
}
