import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { PlusCircle, Search, Wrench, ChevronRight } from 'lucide-react';

interface Repair {
  id: number;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  issue_description: string;
  quoted_price: number;
  pickup_pin: string;
  status: 'Received' | 'In Progress' | 'Complete' | 'Collected';
  created_at: string;
}

const statusBadge: Record<string, string> = {
  'Received':    'badge-gray',
  'In Progress': 'badge-blue',
  'Complete':    'badge-green',
  'Collected':   'badge-amber',
};

const nextStatus: Record<string, string> = {
  'Received':    'In Progress',
  'In Progress': 'Complete',
  'Complete':    'Collected',
};

const Repairs: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { loadRepairs(); }, [search, statusFilter]);

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await client.get('/repairs', { params });
      setRepairs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await client.patch(`/repairs/${id}/status`, { status });
      setRepairs(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Repair Jobs</h1>
          <p className="page-subtitle">{repairs.length} total repairs</p>
        </div>
        <Link to="/repair-intake" className="btn-primary">
          <PlusCircle size={15} />
          New Repair
        </Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 py-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, phone, device or PIN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto min-w-[160px]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Received">Received</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
          <option value="Collected">Collected</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="spinner text-indigo-600" />
          </div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wrench size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No repairs found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  {['ID', 'Customer', 'Device', 'Issue', 'Quote', 'PIN', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repairs.map(repair => (
                  <tr key={repair.id} className="table-row">
                    <td className="table-td text-slate-400 font-mono text-xs">#{repair.id}</td>
                    <td className="table-td">
                      <p className="font-semibold text-slate-800">{repair.customer_name}</p>
                      <p className="text-xs text-slate-400">{repair.customer_phone}</p>
                    </td>
                    <td className="table-td font-medium text-slate-700">{repair.device_model}</td>
                    <td className="table-td text-slate-500 max-w-[180px]">
                      <p className="truncate">{repair.issue_description}</p>
                    </td>
                    <td className="table-td font-semibold text-slate-800">
                      ${parseFloat(String(repair.quoted_price)).toFixed(2)}
                    </td>
                    <td className="table-td">
                      <code className="bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100">
                        {repair.pickup_pin}
                      </code>
                    </td>
                    <td className="table-td">
                      <span className={statusBadge[repair.status] || 'badge-gray'}>{repair.status}</span>
                    </td>
                    <td className="table-td text-slate-400 text-xs">
                      {new Date(repair.created_at).toLocaleDateString()}
                    </td>
                    <td className="table-td">
                      {nextStatus[repair.status] && (
                        <button
                          onClick={() => updateStatus(repair.id, nextStatus[repair.status])}
                          disabled={updatingId === repair.id}
                          className="btn-secondary py-1 px-3 text-xs gap-1"
                        >
                          {updatingId === repair.id ? (
                            <span className="spinner w-3 h-3" />
                          ) : (
                            <>
                              {nextStatus[repair.status]}
                              <ChevronRight size={12} />
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Repairs;
