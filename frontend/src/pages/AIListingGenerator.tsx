import React, { useEffect, useState } from 'react';
import client from '../api/client';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  sell_price: number;
}

interface StockAlert {
  summary: string;
  red_items: any[];
  amber_items: any[];
  ok_count: number;
  total_items: number;
  generated_at: string;
}

const AIListingGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listing' | 'stock'>('listing');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | ''>('');
  const [condition, setCondition] = useState('New');
  const [extraNotes, setExtraNotes] = useState('');
  const [listing, setListing] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Stock alert state
  const [stockAlert, setStockAlert] = useState<StockAlert | null>(null);
  const [loadingAlert, setLoadingAlert] = useState(false);

  useEffect(() => {
    client.get('/inventory').then(res => setInventory(res.data)).catch(console.error);
  }, []);

  const generateListing = async () => {
    if (!selectedItem) return;
    setError('');
    setListing('');
    setGenerating(true);
    try {
      const res = await client.post('/ai/fb-listing', {
        inventory_id: selectedItem,
        condition,
        extra_notes: extraNotes,
      });
      setListing(res.data.listing);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate listing. Check your Anthropic API key.');
    } finally {
      setGenerating(false);
    }
  };

  const generateStockAlert = async () => {
    setLoadingAlert(true);
    setError('');
    try {
      const res = await client.post('/ai/stock-alert');
      setStockAlert(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate stock alert. Check your Anthropic API key.');
    } finally {
      setLoadingAlert(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(listing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = listing;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedInventoryItem = inventory.find(i => i.id === selectedItem);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">AI Tools</h1>
        <p className="page-subtitle">Powered by Claude Sonnet</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('listing')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'listing' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          FB Marketplace Listing
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'stock' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Stock Alert Report
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
          <div>
            {error}
            {error.includes('API key') && (
              <p className="mt-1 text-xs text-red-400">Set your ANTHROPIC_API_KEY in backend/.env</p>
            )}
          </div>
        </div>
      )}

      {/* FB Listing Generator */}
      {activeTab === 'listing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Generate FB Marketplace Listing</h2>

            <div>
              <label className="label">Select Product *</label>
              <select
                className="input"
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">-- Choose from inventory --</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (${item.sell_price}) — {item.quantity} in stock
                  </option>
                ))}
              </select>
            </div>

            {selectedInventoryItem && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-sm">
                <p className="font-semibold text-indigo-800">{selectedInventoryItem.name}</p>
                <p className="text-indigo-500 text-xs mt-0.5">{selectedInventoryItem.category} · ${selectedInventoryItem.sell_price} · {selectedInventoryItem.quantity} in stock</p>
              </div>
            )}

            <div>
              <label className="label">Condition</label>
              <select className="input" value={condition} onChange={e => setCondition(e.target.value)}>
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Refurbished</option>
              </select>
            </div>

            <div>
              <label className="label">Additional Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)}
                placeholder="Any special features, bundle deals, or extra info..."
              />
            </div>

            <button
              onClick={generateListing}
              disabled={!selectedItem || generating}
              className="btn-primary w-full py-2.5"
            >
              {generating ? (
                <><span className="spinner w-4 h-4" /> Generating with Claude…</>
              ) : 'Generate Listing with AI'}
            </button>
          </div>

          {/* Generated Output */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Generated Listing</h2>
              {listing && (
                <button
                  onClick={copyToClipboard}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  {copied ? '✓ Copied!' : 'Copy to clipboard'}
                </button>
              )}
            </div>

            {!listing && !generating && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-sm text-slate-400">Your AI-generated listing will appear here</p>
              </div>
            )}

            {generating && (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="spinner w-8 h-8 text-indigo-600" />
                <p className="text-sm text-slate-400">Claude is crafting your listing…</p>
              </div>
            )}

            {listing && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {listing}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Alert Report */}
      {activeTab === 'stock' && (
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">AI Daily Stock Alert Report</h2>
                <p className="text-xs text-slate-400 mt-0.5">14-day rolling sales velocity analysis</p>
              </div>
              <button onClick={generateStockAlert} disabled={loadingAlert} className="btn-primary">
                {loadingAlert ? <><span className="spinner w-4 h-4" /> Analyzing…</> : 'Generate Report'}
              </button>
            </div>

            {!stockAlert && !loadingAlert && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📊</span>
                </div>
                <p className="text-sm text-slate-400">Click "Generate Report" to analyze your stock levels with AI</p>
              </div>
            )}

            {loadingAlert && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="spinner w-8 h-8 text-indigo-600" />
                <p className="text-sm text-slate-400">Claude is analyzing your 14-day sales velocity…</p>
              </div>
            )}

            {stockAlert && (
              <div className="space-y-5">
                {/* AI Summary */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Summary</span>
                    <span className="text-xs text-indigo-300 ml-auto">{new Date(stockAlert.generated_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{stockAlert.summary}</p>
                </div>

                {/* Alert Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{stockAlert.red_items.length}</p>
                    <p className="text-xs font-semibold text-red-500 mt-1">Order Now</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{'<'} 3 days</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{stockAlert.amber_items.length}</p>
                    <p className="text-xs font-semibold text-amber-500 mt-1">Watch</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{'<'} 7 days</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{stockAlert.ok_count}</p>
                    <p className="text-xs font-semibold text-emerald-500 mt-1">OK</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Healthy</p>
                  </div>
                </div>

                {/* Red Items */}
                {stockAlert.red_items.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-red-100">
                    <div className="bg-red-50 px-4 py-2.5 border-b border-red-100">
                      <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical — Order Immediately</h3>
                    </div>
                    <div className="divide-y divide-red-50">
                      {stockAlert.red_items.map((item: any) => (
                        <div key={item.inventory_id} className="px-4 py-3 flex items-center justify-between bg-white">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">SKU: {item.sku} · {item.daily_velocity}/day avg</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{item.current_stock} left</p>
                            <p className="text-xs text-slate-400">{item.days_remaining < 999 ? `~${item.days_remaining} days` : 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amber Items */}
                {stockAlert.amber_items.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-amber-100">
                    <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100">
                      <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Watch — Order Soon</h3>
                    </div>
                    <div className="divide-y divide-amber-50">
                      {stockAlert.amber_items.map((item: any) => (
                        <div key={item.inventory_id} className="px-4 py-3 flex items-center justify-between bg-white">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">SKU: {item.sku} · {item.daily_velocity}/day avg</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-600">{item.current_stock} left</p>
                            <p className="text-xs text-slate-400">{item.days_remaining < 999 ? `~${item.days_remaining} days` : 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIListingGenerator;
