import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { PlusCircle, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';

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

const stages = ['Received', 'In Progress', 'Complete', 'Collected'] as const;

const stageConfig: Record<string, { header: string; count: string; column: string; accent: string; pin: string }> = {
  'Received':    { header: 'bg-slate-100 text-slate-700',   count: 'bg-slate-200 text-slate-700', column: 'bg-slate-50/70 border-slate-200',    accent: 'border-l-slate-400',   pin: 'bg-slate-100 text-slate-600 border-slate-200' },
  'In Progress': { header: 'bg-blue-600 text-white',        count: 'bg-blue-500 text-white',       column: 'bg-blue-50/30 border-blue-200',      accent: 'border-l-blue-500',    pin: 'bg-blue-50 text-blue-700 border-blue-100' },
  'Complete':    { header: 'bg-emerald-600 text-white',     count: 'bg-emerald-500 text-white',    column: 'bg-emerald-50/30 border-emerald-200', accent: 'border-l-emerald-500', pin: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'Collected':   { header: 'bg-violet-600 text-white',      count: 'bg-violet-500 text-white',     column: 'bg-violet-50/30 border-violet-200',   accent: 'border-l-violet-500',  pin: 'bg-violet-50 text-violet-700 border-violet-100' },
};

const nextStage: Record<string, string> = { 'Received': 'In Progress', 'In Progress': 'Complete', 'Complete': 'Collected' };
const prevStage: Record<string, string> = { 'In Progress': 'Received', 'Complete': 'In Progress', 'Collected': 'Complete' };

const RepairTracker: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { loadRepairs(); }, []);

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const res = await client.get('/repairs');
      setRepairs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await client.patch(`/repairs/${id}/status`, { status: newStatus });
      setRepairs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner text-indigo-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Repair Board</h1>
          <p className="page-subtitle">Received → In Progress → Complete → Collected</p>
        </div>
        <Link to="/repair-intake" className="btn-primary">
          <PlusCircle size={15} /> New Repair
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map(stage => {
          const cfg = stageConfig[stage];
          const stageRepairs = repairs.filter(r => r.status === stage);

          return (
            <div key={stage} className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              {/* Column header */}
              <div className={`flex items-center justify-between px-4 py-3 ${cfg.header}`}>
                <span className="text-sm font-semibold">{stage}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.count}`}>
                  {stageRepairs.length}
                </span>
              </div>

              {/* Cards */}
              <div className={`flex-1 p-3 space-y-2.5 min-h-[280px] border-x border-b ${cfg.column}`}>
                {stageRepairs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2">
                    <Wrench size={18} className="text-slate-300" />
                    <p className="text-xs text-slate-400">No repairs</p>
                  </div>
                ) : (
                  stageRepairs.map(repair => (
                    <div
                      key={repair.id}
                      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 border-l-4 ${cfg.accent}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-sm text-slate-900 truncate">{repair.customer_name}</p>
                        <code className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 ${cfg.pin}`}>
                          {repair.pickup_pin}
                        </code>
                      </div>
                      <p className="text-xs font-medium text-indigo-600 mb-0.5">{repair.device_model}</p>
                      <p className="text-xs text-slate-400 truncate mb-2.5">{repair.issue_description}</p>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-emerald-700">
                          ${parseFloat(String(repair.quoted_price)).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(repair.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        {prevStage[stage] && (
                          <button
                            onClick={() => updateStatus(repair.id, prevStage[stage])}
                            disabled={updatingId === repair.id}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
                          >
                            <ChevronLeft size={11} /> Back
                          </button>
                        )}
                        {nextStage[stage] && (
                          <button
                            onClick={() => updateStatus(repair.id, nextStage[stage])}
                            disabled={updatingId === repair.id}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 font-medium"
                          >
                            {updatingId === repair.id
                              ? <span className="spinner w-3 h-3" />
                              : <><ChevronRight size={11} /> {nextStage[stage].split(' ')[0]}</>
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepairTracker;
