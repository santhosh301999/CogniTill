import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Search, ShoppingCart, Trash2, CheckCircle2, Tag, Banknote, CreditCard, AlertTriangle, Vault, Lock } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  sell_price: number;
}

interface CartItem {
  inventory_id: number | null;
  name: string;
  quantity: number;
  unit_price: number;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  category: string;
}

const TAX_RATE = 0.13;

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Debit' | 'Credit'>('Cash');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState('');
  const [registerStatus, setRegisterStatus] = useState<{ is_open: boolean; is_closed: boolean } | null>(null);
  const [registerLoading, setRegisterLoading] = useState(true);

  useEffect(() => {
    client.get('/reports/register-status')
      .then(res => setRegisterStatus(res.data))
      .catch(() => setRegisterStatus(null))
      .finally(() => setRegisterLoading(false));
  }, []);

  useEffect(() => { loadInventory(); }, [search]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const res = await client.get('/inventory', { params });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.inventory_id === item.id);
      if (existing) {
        return prev.map(c => c.inventory_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        inventory_id: item.id,
        name: item.name,
        quantity: 1,
        unit_price: item.sell_price,
        discount_type: 'amount',
        discount_value: 0,
        category: item.category,
      }];
    });
  };

  const removeFromCart = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx));

  const updateCartItem = (idx: number, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const getLineTotal = (item: CartItem) => {
    let total = item.quantity * item.unit_price;
    if (item.discount_type === 'percent') total = total * (1 - item.discount_value / 100);
    else total = total - item.discount_value;
    return Math.max(0, total);
  };

  const subtotal = cart.reduce((sum, item) => sum + getLineTotal(item), 0);
  const taxAmount = taxEnabled ? subtotal * TAX_RATE : 0;
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/sales', {
        items: cart.map(item => ({
          inventory_id: item.inventory_id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          category: item.category,
        })),
        tax_enabled: taxEnabled,
        payment_mode: paymentMode,
        overall_discount_value: 0,
      });
      setReceipt(res.data);
      setCart([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (registerLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner text-indigo-600 w-8 h-8" />
    </div>
  );

  if (registerStatus && !registerStatus.is_open) return (
    <div className="max-w-lg mx-auto">
      <div className="card text-center py-10 space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${registerStatus.is_closed ? 'bg-red-100' : 'bg-amber-100'}`}>
          {registerStatus.is_closed
            ? <Lock size={28} className="text-red-500" />
            : <Vault size={28} className="text-amber-500" />
          }
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {registerStatus.is_closed ? 'Register Closed' : 'Register Not Open'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {registerStatus.is_closed
              ? 'The register was closed. Re-open the register to continue processing sales.'
              : 'You must open the register before processing sales.'
            }
          </p>
        </div>
        <button onClick={() => navigate('/open-register')} className="btn-primary px-6 py-2.5">
          Open Register
        </button>
      </div>
    </div>
  );

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sale Complete</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6">Receipt #{receipt.id}</p>

          <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-left">
            {receipt.sale_items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.name} × {item.quantity}</span>
                <span className="font-semibold text-slate-800">${parseFloat(item.line_total).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-left px-1 mb-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span><span>${parseFloat(receipt.subtotal).toFixed(2)}</span>
            </div>
            {receipt.tax_enabled === 1 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>HST (13%)</span><span>${parseFloat(receipt.tax_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
              <span>Total</span><span>${parseFloat(receipt.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-slate-400">Payment</span>
              <span className="badge-blue">{receipt.payment_mode}</span>
            </div>
          </div>

          <button
            onClick={() => { setReceipt(null); loadInventory(); }}
            className="btn-primary w-full"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  const paymentOptions = [
    { mode: 'Cash' as const,   icon: Banknote,   color: 'text-emerald-600' },
    { mode: 'Debit' as const,  icon: CreditCard, color: 'text-blue-600' },
    { mode: 'Credit' as const, icon: CreditCard, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: product grid + cart */}
        <div className="xl:col-span-2 space-y-4">
          {/* Product search */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">Products</h2>
              {loading && <span className="spinner w-4 h-4 text-slate-400" />}
            </div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {inventory.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={item.quantity === 0}
                  className="group text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700">{item.name}</p>
                  <p className="text-[11px] text-slate-400 mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-600">${Number(item.sell_price).toFixed(2)}</span>
                    <span className={`text-[11px] font-medium ${item.quantity <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                      {item.quantity} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={15} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-800">Cart ({cart.length} items)</h2>
              </div>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium block mb-1">Qty</label>
                        <input
                          type="number" min="1" value={item.quantity}
                          onChange={e => updateCartItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="input py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium block mb-1">Unit Price</label>
                        <input
                          type="number" min="0" step="0.01" value={item.unit_price}
                          onChange={e => updateCartItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="input py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                          <Tag size={9} /> Discount
                        </label>
                        <div className="flex gap-1">
                          <select
                            value={item.discount_type}
                            onChange={e => updateCartItem(idx, 'discount_type', e.target.value)}
                            className="input py-1.5 text-xs w-12 flex-shrink-0 px-1.5"
                          >
                            <option value="amount">$</option>
                            <option value="percent">%</option>
                          </select>
                          <input
                            type="number" min="0" step="0.01" value={item.discount_value}
                            onChange={e => updateCartItem(idx, 'discount_value', parseFloat(e.target.value) || 0)}
                            className="input py-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-end justify-end pb-0.5">
                        <p className="text-sm font-bold text-slate-900">${getLineTotal(item).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="card sticky top-20 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">{error}</div>
            )}

            {/* Tax toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-700">HST (13%)</p>
                <p className="text-xs text-slate-400">Ontario tax</p>
              </div>
              <button
                onClick={() => setTaxEnabled(v => !v)}
                className={`toggle ${taxEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`toggle-thumb ${taxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Payment mode */}
            <div>
              <p className="label">Payment Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map(({ mode, icon: Icon, color }) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                      paymentMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <Icon size={14} className={paymentMode === mode ? 'text-white' : color} />
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {taxEnabled && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>HST (13%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || submitting}
              className="btn-primary w-full py-3 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <span className="spinner w-4 h-4" />
                  Processing…
                </>
              ) : cart.length === 0 ? 'Add items to cart' : `Charge ${paymentMode} — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
