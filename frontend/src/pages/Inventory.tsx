import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Search, Plus, Truck, Save, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  cost_price: number;
  sell_price: number;
  low_stock_threshold: number;
  updated_at: string;
}

interface BulkUpdate {
  id: number;
  quantity_add: number;
  cost_price: number | '';
  sell_price: number | '';
}

const categories = ['Accessory', 'SIM', 'Parts', 'Voucher', 'Other'];

const catBadge: Record<string, string> = {
  Accessory: 'badge-blue',
  SIM:       'badge-green',
  Parts:     'badge-amber',
  Voucher:   'badge-gray',
  Other:     'badge-gray',
};

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdate[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', category: 'Accessory', quantity: 0, cost_price: 0, sell_price: 0, low_stock_threshold: 5 });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { loadInventory(); }, [search, categoryFilter]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await client.get('/inventory', { params });
      setItems(res.data);
      setBulkUpdates(res.data.map((i: InventoryItem) => ({ id: i.id, quantity_add: 0, cost_price: '', sell_price: '' })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBulkField = (id: number, field: keyof BulkUpdate, value: any) => {
    setBulkUpdates(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const submitBulkUpdate = async () => {
    const changed = bulkUpdates.filter(u => u.quantity_add !== 0 || u.cost_price !== '' || u.sell_price !== '');
    if (changed.length === 0) return;
    setSaving(true);
    setError('');
    try {
      await client.post('/inventory/bulk-update', {
        updates: changed.map(u => ({
          id: u.id,
          quantity_add: u.quantity_add || 0,
          cost_price: u.cost_price !== '' ? u.cost_price : undefined,
          sell_price: u.sell_price !== '' ? u.sell_price : undefined,
        })),
      });
      setSuccessMsg(`Updated ${changed.length} item${changed.length > 1 ? 's' : ''} successfully`);
      setBulkMode(false);
      loadInventory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bulk update failed');
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/inventory', newItem);
      setSuccessMsg('Item added successfully');
      setShowAddForm(false);
      setNewItem({ name: '', sku: '', category: 'Accessory', quantity: 0, cost_price: 0, sell_price: 0, low_stock_threshold: 5 });
      loadInventory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add item');
    }
  };

  const deleteItem = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/inventory/${id}`);
      loadInventory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{items.length} items tracked</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setBulkMode(v => !v); setShowAddForm(false); }}
            className={bulkMode ? 'btn-primary' : 'btn-secondary'}
          >
            <Truck size={14} />
            {bulkMode ? 'Exit Delivery Mode' : 'Delivery Update'}
          </button>
          <button
            onClick={() => { setShowAddForm(v => !v); setBulkMode(false); }}
            className="btn-primary"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
          <CheckCircle2 size={15} className="flex-shrink-0" /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          <AlertTriangle size={15} className="flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Add New Item</h2>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <form onSubmit={addItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} required placeholder="USB-C Cable 2m" />
            </div>
            <div>
              <label className="label">SKU *</label>
              <input className="input" value={newItem.sku} onChange={e => setNewItem(p => ({ ...p, sku: e.target.value }))} required placeholder="ACC-001" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" className="input" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Cost Price ($)</label>
              <input type="number" step="0.01" className="input" value={newItem.cost_price} onChange={e => setNewItem(p => ({ ...p, cost_price: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Sell Price ($)</label>
              <input type="number" step="0.01" className="input" value={newItem.sell_price} onChange={e => setNewItem(p => ({ ...p, sell_price: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Low Stock Alert</label>
              <input type="number" className="input" value={newItem.low_stock_threshold} onChange={e => setNewItem(p => ({ ...p, low_stock_threshold: parseInt(e.target.value) || 5 }))} />
            </div>
            <div className="col-span-2 sm:col-span-4 flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary"><Plus size={14} /> Add Item</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 py-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto min-w-[150px]" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Bulk mode banner */}
      {bulkMode && (
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-2.5">
            <Truck size={15} className="text-indigo-600" />
            <p className="text-sm font-medium text-indigo-800">
              Delivery Update Mode — enter quantities to add and new prices inline
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBulkMode(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
            <button onClick={submitBulkUpdate} disabled={saving} className="btn-primary text-xs py-1.5">
              {saving ? <><span className="spinner w-3.5 h-3.5" /> Saving…</> : <><Save size={13} /> Save All</>}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="spinner text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">SKU</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">Cost</th>
                  <th className="table-th">Sell Price</th>
                  {bulkMode && <th className="table-th">+ Qty</th>}
                  {bulkMode && <th className="table-th">New Cost</th>}
                  {bulkMode && <th className="table-th">New Price</th>}
                  {!bulkMode && <th className="table-th">Status</th>}
                  {!bulkMode && <th className="table-th"></th>}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isLow = item.quantity <= item.low_stock_threshold;
                  const bu = bulkUpdates.find(u => u.id === item.id);

                  return (
                    <tr key={item.id} className={`table-row ${isLow && !bulkMode ? 'bg-red-50/50' : ''}`}>
                      <td className="table-td">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                      </td>
                      <td className="table-td">
                        <code className="text-xs text-slate-400 font-mono">{item.sku}</code>
                      </td>
                      <td className="table-td">
                        <span className={catBadge[item.category] || 'badge-gray'}>{item.category}</span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          {isLow && <AlertTriangle size={12} className="text-red-500" />}
                          <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-slate-400">/ {item.low_stock_threshold} min</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-500">${Number(item.cost_price).toFixed(2)}</td>
                      <td className="table-td font-semibold text-slate-800">${Number(item.sell_price).toFixed(2)}</td>

                      {bulkMode && bu && (
                        <>
                          <td className="table-td">
                            <input
                              type="number" min="0" value={bu.quantity_add}
                              onChange={e => updateBulkField(item.id, 'quantity_add', parseInt(e.target.value) || 0)}
                              className="input py-1.5 w-20 text-center"
                              placeholder="0"
                            />
                          </td>
                          <td className="table-td">
                            <input
                              type="number" min="0" step="0.01" value={bu.cost_price}
                              onChange={e => updateBulkField(item.id, 'cost_price', e.target.value ? parseFloat(e.target.value) : '')}
                              className="input py-1.5 w-24"
                              placeholder={Number(item.cost_price).toFixed(2)}
                            />
                          </td>
                          <td className="table-td">
                            <input
                              type="number" min="0" step="0.01" value={bu.sell_price}
                              onChange={e => updateBulkField(item.id, 'sell_price', e.target.value ? parseFloat(e.target.value) : '')}
                              className="input py-1.5 w-24"
                              placeholder={Number(item.sell_price).toFixed(2)}
                            />
                          </td>
                        </>
                      )}

                      {!bulkMode && (
                        <td className="table-td">
                          {isLow
                            ? <span className="badge-red">Low Stock</span>
                            : <span className="badge-green">In Stock</span>
                          }
                        </td>
                      )}
                      {!bulkMode && (
                        <td className="table-td">
                          <button
                            onClick={() => deleteItem(item.id, item.name)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
