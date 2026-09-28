import React, { useMemo, useState } from 'react';
import { ModuleShell, EmptyState } from './ModuleShell';

export default function InventoryModule({ items, onCreate, onUpdate, onDelete, busy }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Medical', quantity: 0, unit: 'units', reorderLevel: 10, location: 'Central Relief Warehouse' });
  const filtered = useMemo(() => items.filter(x => `${x.name} ${x.category} ${x.sku} ${x.location}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const low = items.filter(x => x.status === 'low' || Number(x.quantity) <= Number(x.reorder_level)).length;

  async function submit(e) {
    e.preventDefault();
    await onCreate(form);
    setForm({ name: '', category: 'Medical', quantity: 0, unit: 'units', reorderLevel: 10, location: 'Central Relief Warehouse' });
    setShowForm(false);
  }

  return (
    <ModuleShell eyebrow="LOGISTICS CONTROL" title="Inventory & Supplies" subtitle="Real MySQL-backed stock control for emergency stores and field depots."
      actions={<button className="module-primary" onClick={() => setShowForm(v => !v)}>+ ADD ITEM</button>}>
      <div className="module-stat-row">
        <div><span>TOTAL STOCK LINES</span><b>{items.length}</b></div><div><span>LOW STOCK</span><b className="danger-text">{low}</b></div><div><span>WAREHOUSES</span><b>{new Set(items.map(x => x.location)).size}</b></div>
      </div>
      {showForm && <form className="module-form" onSubmit={submit}>
        <input required placeholder="Item name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <input type="number" min="0" step="0.01" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/>
        <input placeholder="Unit" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/>
        <input type="number" min="0" step="0.01" placeholder="Reorder level" value={form.reorderLevel} onChange={e=>setForm({...form,reorderLevel:e.target.value})}/>
        <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
        <button disabled={busy} className="module-primary" type="submit">SAVE TO MYSQL</button>
      </form>}
      <div className="module-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search SKU, item, category or depot..."/></div>
      <div className="module-table-wrap"><table className="module-table"><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Quantity</th><th>Reorder</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {filtered.map(item => <tr key={item.id}><td>{item.sku}</td><td><strong>{item.name}</strong></td><td>{item.category}</td><td><input className="inline-number" type="number" defaultValue={item.quantity} onBlur={e=>{ if(Number(e.target.value)!==Number(item.quantity)) onUpdate(item.id,{quantity:Number(e.target.value)}) }}/>&nbsp;{item.unit}</td><td>{item.reorder_level}</td><td>{item.location}</td><td><span className={`status-chip ${item.status}`}>{item.status.toUpperCase()}</span></td><td><button className="table-action danger" onClick={()=>onDelete(item.id)}>DELETE</button></td></tr>)}
      </tbody></table>{!filtered.length && <EmptyState>No matching inventory records.</EmptyState>}</div>
    </ModuleShell>
  );
}
