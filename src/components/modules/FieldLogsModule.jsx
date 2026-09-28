import React, { useState } from 'react';
import { ModuleShell, EmptyState } from './ModuleShell';

export default function FieldLogsModule({ logs, onCreate, busy }) {
  const [form, setForm] = useState({ unitName:'UNIT-408', location:'Kalutara', level:'info', message:'' });
  async function submit(e){ e.preventDefault(); await onCreate(form); setForm({...form,message:''}); }
  return <ModuleShell eyebrow="FIELD OPERATIONS JOURNAL" title="Field Logs" subtitle="Append-only operational notes with operator identity and database timestamps.">
    <form className="log-composer" onSubmit={submit}>
      <input required value={form.unitName} onChange={e=>setForm({...form,unitName:e.target.value})} placeholder="Unit name"/>
      <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location"/>
      <select value={form.level} onChange={e=>setForm({...form,level:e.target.value})}><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select>
      <textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Write operational field log..."/>
      <button disabled={busy} className="module-primary">PUBLISH LOG</button>
    </form>
    <div className="log-stream">{logs.map(log=><article className={`log-card ${log.level}`} key={log.id}><div className="log-marker"/><div><div className="log-meta"><b>{log.unit_name}</b><span>{log.location || 'Unknown location'}</span><time>{new Date(log.created_at).toLocaleString()}</time></div><p>{log.message}</p><small>{log.created_by_name ? `Logged by ${log.created_by_name}` : 'System seed record'}</small></div></article>)}{!logs.length&&<EmptyState>No field logs yet.</EmptyState>}</div>
  </ModuleShell>
}
