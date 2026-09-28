import React, { useMemo, useState } from 'react';
import { ModuleShell, EmptyState } from './ModuleShell';

export default function VolunteersModule({ volunteers, onCreate, onUpdate, onDelete, busy }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName:'', phone:'', skills:'', district:'Galle', status:'available', assignedUnit:'' });
  const filtered = useMemo(() => volunteers.filter(v => `${v.full_name} ${v.skills} ${v.district} ${v.code}`.toLowerCase().includes(query.toLowerCase())), [volunteers, query]);
  async function submit(e){ e.preventDefault(); await onCreate(form); setForm({ fullName:'', phone:'', skills:'', district:'Galle', status:'available', assignedUnit:'' }); setShowForm(false); }
  return <ModuleShell eyebrow="HUMAN RESPONSE NETWORK" title="Volunteer Hub" subtitle="Register, assign and track volunteer responders stored in MySQL."
    actions={<button className="module-primary" onClick={()=>setShowForm(v=>!v)}>+ REGISTER VOLUNTEER</button>}>
    <div className="module-stat-row"><div><span>REGISTERED</span><b>{volunteers.length}</b></div><div><span>AVAILABLE</span><b className="green-text">{volunteers.filter(v=>v.status==='available').length}</b></div><div><span>ASSIGNED</span><b>{volunteers.filter(v=>v.status==='assigned').length}</b></div></div>
    {showForm && <form className="module-form" onSubmit={submit}>
      <input required placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>
      <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
      <input placeholder="Skills" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/>
      <input placeholder="District" value={form.district} onChange={e=>setForm({...form,district:e.target.value})}/>
      <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="available">Available</option><option value="assigned">Assigned</option><option value="off_duty">Off duty</option></select>
      <input placeholder="Assigned unit" value={form.assignedUnit} onChange={e=>setForm({...form,assignedUnit:e.target.value})}/>
      <button disabled={busy} className="module-primary">SAVE TO MYSQL</button>
    </form>}
    <div className="module-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search volunteer, skill, district..."/></div>
    <div className="module-table-wrap"><table className="module-table"><thead><tr><th>Code</th><th>Name</th><th>District</th><th>Skills</th><th>Phone</th><th>Status</th><th>Assigned Unit</th><th>Actions</th></tr></thead><tbody>
      {filtered.map(v=><tr key={v.id}><td>{v.code}</td><td><strong>{v.full_name}</strong></td><td>{v.district}</td><td>{v.skills}</td><td>{v.phone}</td><td><select className="inline-select" value={v.status} onChange={e=>onUpdate(v.id,{status:e.target.value})}><option value="available">Available</option><option value="assigned">Assigned</option><option value="off_duty">Off duty</option></select></td><td>{v.assigned_unit || '—'}</td><td><button className="table-action danger" onClick={()=>onDelete(v.id)}>DELETE</button></td></tr>)}
    </tbody></table>{!filtered.length && <EmptyState>No matching volunteers.</EmptyState>}</div>
  </ModuleShell>
}
