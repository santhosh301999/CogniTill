-- Run this in your Supabase project → SQL Editor → New query

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repairs (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  quoted_price NUMERIC NOT NULL,
  pickup_pin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Received' CHECK(status IN ('Received', 'In Progress', 'Complete', 'Collected')),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Accessory',
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sell_price NUMERIC NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  items TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  tax_enabled INTEGER NOT NULL DEFAULT 1,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'Cash' CHECK(payment_mode IN ('Cash', 'Debit', 'Credit')),
  category TEXT NOT NULL DEFAULT 'Accessory',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  inventory_id BIGINT REFERENCES inventory(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  discount_type TEXT DEFAULT 'amount',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'Accessory'
);

CREATE TABLE IF NOT EXISTS close_wizard_sessions (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  cash_counted NUMERIC NOT NULL DEFAULT 0,
  expected_cash NUMERIC NOT NULL DEFAULT 0,
  float_removed NUMERIC NOT NULL DEFAULT 200,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  variance NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  denominations TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS open_register_sessions (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  float_target NUMERIC NOT NULL DEFAULT 200,
  float_counted NUMERIC NOT NULL DEFAULT 0,
  shortage NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  denominations TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vouchers (
  id BIGSERIAL PRIMARY KEY,
  carrier TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  customer_phone TEXT NOT NULL,
  sold_at NUMERIC NOT NULL,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Sold' CHECK(status IN ('Sold', 'Pending', 'Failed')),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eod_reports (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  repairs_completed INTEGER NOT NULL DEFAULT 0,
  inventory_alerts TEXT,
  summary TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
