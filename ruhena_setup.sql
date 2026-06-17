-- ============================================================
-- RUHENA HEALTHCARE LIMITED — Supabase Database Setup
-- Run this ONCE in Supabase SQL Editor → New Query
-- ============================================================

drop table if exists b2b_orders cascade;
drop table if exists b2b_customers cascade;
drop table if exists expenses cascade;
drop table if exists inventory cascade;
drop table if exists orders cascade;
drop table if exists suppliers cascade;
drop table if exists debts cascade;
drop table if exists sales cascade;
drop table if exists users cascade;

-- ── USERS (Authentication) ─────────────────────────────────
create table users (
  id text primary key,
  name text not null,
  username text not null unique,
  pin text not null,
  role text not null default 'salesperson',
  -- role: 'salesperson' | 'owner'
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  created_by text default ''
);

-- ── SALES ──────────────────────────────────────────────────
create table sales (
  id text primary key,
  date text not null,
  medicine text not null,
  qty integer not null default 0,
  price numeric not null default 0,
  total numeric not null default 0,
  pm text not null default 'C',
  notes text default '',
  added_by text default '',
  added_at text default ''
);

-- ── DEBTS ──────────────────────────────────────────────────
create table debts (
  id text primary key,
  name text not null,
  phone text not null,
  residence text not null,
  house text default '',
  medicines jsonb default '[]',
  amount numeric not null default 0,
  paid numeric not null default 0,
  date text not null,
  status text default 'owing',
  added_by text default '',
  added_at text default ''
);

-- ── ORDERS ─────────────────────────────────────────────────
create table orders (
  id text primary key,
  date text not null,
  supplier_id text default '',
  supplier_name text default '',
  medicine text not null,
  qty integer not null default 0,
  buy numeric not null default 0,
  sell numeric not null default 0,
  total numeric not null default 0,
  profit numeric not null default 0,
  notes text default '',
  order_ref text default '',
  invoice_number text default '',
  batch_number text default '',
  added_by text default '',
  added_at text default ''
);

-- ── SUPPLIERS ──────────────────────────────────────────────
create table suppliers (
  id text primary key,
  name text not null,
  phone text default '',
  email text default ''
);

-- ── INVENTORY ──────────────────────────────────────────────
create table inventory (
  id text primary key,
  name text not null,
  category text default 'Other',
  price numeric not null default 0,
  stock integer not null default 0,
  alert_at integer not null default 10,
  unit_cost numeric default 0,
  created_at text default ''
);

-- ── EXPENSES ───────────────────────────────────────────────
create table expenses (
  id text primary key,
  date text not null,
  category text not null,
  description text default '',
  amount numeric not null default 0,
  pm text default 'C',
  added_by text default '',
  added_at text default ''
);

-- ── B2B CUSTOMERS ──────────────────────────────────────────
create table b2b_customers (
  id text primary key,
  business_name text not null,
  contact_person text default '',
  phone text not null,
  email text default '',
  address text default '',
  credit_limit numeric default 0,
  balance numeric default 0,
  total_purchased numeric default 0,
  created_at text default ''
);

-- ── B2B ORDERS ─────────────────────────────────────────────
create table b2b_orders (
  id text primary key,
  customer_id text not null,
  business_name text default '',
  invoice_number text not null,
  date text not null,
  items jsonb default '[]',
  subtotal numeric not null default 0,
  previous_balance numeric default 0,
  total numeric not null default 0,
  amount_paid numeric default 0,
  balance_due numeric default 0,
  payment_status text default 'pending',
  order_ref text default '',
  added_by text default '',
  added_at text default ''
);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
alter table users enable row level security;
alter table sales enable row level security;
alter table debts enable row level security;
alter table orders enable row level security;
alter table suppliers enable row level security;
alter table inventory enable row level security;
alter table expenses enable row level security;
alter table b2b_customers enable row level security;
alter table b2b_orders enable row level security;

create policy "allow all" on users for all using (true) with check (true);
create policy "allow all" on sales for all using (true) with check (true);
create policy "allow all" on debts for all using (true) with check (true);
create policy "allow all" on orders for all using (true) with check (true);
create policy "allow all" on suppliers for all using (true) with check (true);
create policy "allow all" on inventory for all using (true) with check (true);
create policy "allow all" on expenses for all using (true) with check (true);
create policy "allow all" on b2b_customers for all using (true) with check (true);
create policy "allow all" on b2b_orders for all using (true) with check (true);

grant all on users to anon, authenticated;
grant all on sales to anon, authenticated;
grant all on debts to anon, authenticated;
grant all on orders to anon, authenticated;
grant all on suppliers to anon, authenticated;
grant all on inventory to anon, authenticated;
grant all on expenses to anon, authenticated;
grant all on b2b_customers to anon, authenticated;
grant all on b2b_orders to anon, authenticated;
