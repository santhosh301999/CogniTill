import bcrypt from 'bcryptjs';
import pool from './db';

async function seed() {
  console.log('Seeding database...');

  // Seed users
  const users = [
    { username: 'danees', password: 'admin123', role: 'admin', name: 'Danees (Shop Owner)' },
    { username: 'kiran', password: 'manager123', role: 'manager', name: 'Kiran (Manager)' },
    { username: 'waseem', password: 'employee123', role: 'employee', name: 'Waseem (Employee)' },
  ];

  for (const user of users) {
    const hashed = bcrypt.hashSync(user.password, 10);
    await pool.query(
      `INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`,
      [user.username, hashed, user.role, user.name]
    );
  }

  // Seed inventory items
  const inventoryItems = [
    { name: 'iPhone 15 Screen', sku: 'IPH15-SCR', category: 'Parts', quantity: 12, cost_price: 85, sell_price: 149.99, low_stock_threshold: 3 },
    { name: 'Samsung S24 Battery', sku: 'SAM-S24-BAT', category: 'Parts', quantity: 8, cost_price: 25, sell_price: 59.99, low_stock_threshold: 3 },
    { name: 'USB-C Cable 1m', sku: 'USBC-1M', category: 'Accessory', quantity: 45, cost_price: 4, sell_price: 14.99, low_stock_threshold: 10 },
    { name: 'iPhone 15 Case', sku: 'IPH15-CASE', category: 'Accessory', quantity: 30, cost_price: 6, sell_price: 24.99, low_stock_threshold: 10 },
    { name: 'Screen Protector Universal', sku: 'SCRPRO-UNI', category: 'Accessory', quantity: 60, cost_price: 2, sell_price: 9.99, low_stock_threshold: 15 },
    { name: 'Koodo SIM Card', sku: 'SIM-KOODO', category: 'SIM', quantity: 15, cost_price: 5, sell_price: 10, low_stock_threshold: 5 },
    { name: 'Rogers SIM Card', sku: 'SIM-ROGERS', category: 'SIM', quantity: 12, cost_price: 5, sell_price: 10, low_stock_threshold: 5 },
    { name: 'Telus SIM Card', sku: 'SIM-TELUS', category: 'SIM', quantity: 3, cost_price: 5, sell_price: 10, low_stock_threshold: 5 },
    { name: 'Wireless Charger 15W', sku: 'WC-15W', category: 'Accessory', quantity: 2, cost_price: 12, sell_price: 34.99, low_stock_threshold: 5 },
    { name: 'Bluetooth Earbuds', sku: 'BT-EARBUDS', category: 'Accessory', quantity: 7, cost_price: 18, sell_price: 49.99, low_stock_threshold: 5 },
    { name: 'Phone Stand Adjustable', sku: 'PHSTAND-ADJ', category: 'Accessory', quantity: 20, cost_price: 5, sell_price: 19.99, low_stock_threshold: 5 },
    { name: 'Samsung S24 Screen', sku: 'SAM-S24-SCR', category: 'Parts', quantity: 4, cost_price: 90, sell_price: 169.99, low_stock_threshold: 2 },
    { name: 'Lightning Cable 1m', sku: 'LTNG-1M', category: 'Accessory', quantity: 25, cost_price: 4, sell_price: 14.99, low_stock_threshold: 10 },
    { name: 'Car Phone Mount', sku: 'CAR-MOUNT', category: 'Accessory', quantity: 18, cost_price: 7, sell_price: 22.99, low_stock_threshold: 5 },
    { name: 'Power Bank 10000mAh', sku: 'PB-10K', category: 'Accessory', quantity: 1, cost_price: 22, sell_price: 54.99, low_stock_threshold: 3 },
  ];

  for (const item of inventoryItems) {
    await pool.query(
      `INSERT INTO inventory (name, sku, category, quantity, cost_price, sell_price, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (sku) DO NOTHING`,
      [item.name, item.sku, item.category, item.quantity, item.cost_price, item.sell_price, item.low_stock_threshold]
    );
  }

  // Seed sample repairs
  const repairs = [
    { customer_name: 'John Smith',   customer_phone: '6471234567', device_model: 'iPhone 14 Pro',        issue_description: 'Cracked screen, touch not working',         quoted_price: 189.99, pickup_pin: '4821', status: 'In Progress' },
    { customer_name: 'Maria Garcia', customer_phone: '4169876543', device_model: 'Samsung Galaxy S23',   issue_description: 'Battery draining very fast, only lasts 2 hours', quoted_price: 79.99, pickup_pin: '7634', status: 'Received' },
    { customer_name: 'David Lee',    customer_phone: '9058887777', device_model: 'Google Pixel 7',       issue_description: 'Back glass shattered, camera still working', quoted_price: 99.99,  pickup_pin: '2951', status: 'Complete' },
    { customer_name: 'Sarah Johnson',customer_phone: '6478889999', device_model: 'iPhone 13',            issue_description: 'Water damage - phone not turning on',        quoted_price: 149.99, pickup_pin: '6103', status: 'Collected' },
  ];

  const adminUser = (await pool.query('SELECT id FROM users WHERE username = $1', ['danees'])).rows[0];
  if (adminUser) {
    for (const repair of repairs) {
      await pool.query(
        `INSERT INTO repairs (customer_name, customer_phone, device_model, issue_description, quoted_price, pickup_pin, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [repair.customer_name, repair.customer_phone, repair.device_model, repair.issue_description,
         repair.quoted_price, repair.pickup_pin, repair.status, adminUser.id]
      );
    }
  }

  // Seed sample sales (only if none exist)
  const salesCount = (await pool.query('SELECT COUNT(*) as cnt FROM sales')).rows[0];
  if (parseInt(salesCount.cnt) === 0 && adminUser) {
    const sampleSales = [
      { daysAgo: 1,  sku: 'USBC-1M',    name: 'USB-C Cable 1m',            qty: 2, price: 14.99, cat: 'Accessory' },
      { daysAgo: 1,  sku: 'SCRPRO-UNI', name: 'Screen Protector Universal', qty: 3, price: 9.99,  cat: 'Accessory' },
      { daysAgo: 2,  sku: 'SIM-KOODO',  name: 'Koodo SIM Card',            qty: 1, price: 10,    cat: 'SIM' },
      { daysAgo: 3,  sku: 'IPH15-CASE', name: 'iPhone 15 Case',            qty: 2, price: 24.99, cat: 'Accessory' },
      { daysAgo: 3,  sku: 'BT-EARBUDS', name: 'Bluetooth Earbuds',         qty: 1, price: 49.99, cat: 'Accessory' },
      { daysAgo: 5,  sku: 'USBC-1M',    name: 'USB-C Cable 1m',            qty: 1, price: 14.99, cat: 'Accessory' },
      { daysAgo: 7,  sku: 'SIM-ROGERS', name: 'Rogers SIM Card',           qty: 2, price: 10,    cat: 'SIM' },
      { daysAgo: 8,  sku: 'LTNG-1M',    name: 'Lightning Cable 1m',        qty: 1, price: 14.99, cat: 'Accessory' },
      { daysAgo: 10, sku: 'SCRPRO-UNI', name: 'Screen Protector Universal', qty: 2, price: 9.99,  cat: 'Accessory' },
      { daysAgo: 12, sku: 'CAR-MOUNT',  name: 'Car Phone Mount',           qty: 1, price: 22.99, cat: 'Accessory' },
    ];

    for (const s of sampleSales) {
      const invItem = (await pool.query('SELECT id FROM inventory WHERE sku = $1', [s.sku])).rows[0];
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - s.daysAgo);
      const subtotal = s.qty * s.price;
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      const saleResult = await pool.query(
        `INSERT INTO sales (items, subtotal, discount_amount, tax_enabled, tax_amount, total, payment_mode, category, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [JSON.stringify([{ name: s.name, qty: s.qty, price: s.price }]),
         subtotal, 0, 1, tax, total, 'Cash', s.cat, adminUser.id, saleDate.toISOString()]
      );

      if (invItem) {
        await pool.query(
          `INSERT INTO sale_items (sale_id, inventory_id, name, quantity, unit_price, discount_type, discount_value, line_total, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [saleResult.rows[0].id, invItem.id, s.name, s.qty, s.price, 'amount', 0, subtotal, s.cat]
        );
      }
    }
  }

  console.log('Database seeded successfully!');
  console.log('  danees / admin123 (admin)');
  console.log('  kiran / manager123 (manager)');
  console.log('  waseem / employee123 (employee)');
  await pool.end();
}

seed().catch(console.error);
