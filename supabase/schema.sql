-- ============================================================================
-- Elhusseiny Products (منتجات الحسيني) — Supabase Postgres Schema
-- ============================================================================
-- Run this in Supabase Dashboard -> SQL Editor.
-- All tables use UUID primary keys, strict constraints, and Row Level Security.

-- Enable pgcrypto if not already enabled (for gen_random_uuid)
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. Helper Trigger for updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. Tables
-- ============================================================================

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders table
-- Note: user_id is nullable to support fast guest checkout in Egypt.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ELH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  city text not null,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order Items table (stores price/name snapshot at time of purchase)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) generated always as (unit_price * quantity) stored
);

-- Payments table (tracks Paymob Intentions API transactions & webhook updates)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'paymob',
  paymob_intention_id text,
  paymob_order_id bigint,
  paymob_transaction_id bigint unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EGP',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. updated_at Triggers
-- ============================================================================
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. Indexes for Fast Queries
-- ============================================================================

-- Active categories sorted for storefront navigation
create index idx_categories_active_sort
  on public.categories (sort_order, name)
  where is_active = true;

-- Active products by category & newest first (covers main shop & category pages)
create index idx_products_active_category
  on public.products (category_id, created_at desc)
  where is_active = true;

-- Customer "My Orders" lookup
create index idx_orders_user_created
  on public.orders (user_id, created_at desc)
  where user_id is not null;

-- Admin order listing sorted by newest first
create index idx_orders_created_at_desc
  on public.orders (created_at desc);

-- Admin order filtering by status & date
create index idx_orders_status_created
  on public.orders (status, created_at desc);

-- Quick order lookup by Egyptian phone number
create index idx_orders_customer_phone
  on public.orders (customer_phone);

-- Foreign key indexes (Postgres does not auto-index foreign keys)
create index idx_order_items_order_id
  on public.order_items (order_id);

create index idx_order_items_product_id
  on public.order_items (product_id);

create index idx_payments_order_id
  on public.payments (order_id);

-- Fast Paymob webhook lookup by paymob_order_id or paymob_intention_id
create index idx_payments_paymob_order_id
  on public.payments (paymob_order_id)
  where paymob_order_id is not null;

create index idx_payments_paymob_intention_id
  on public.payments (paymob_intention_id)
  where paymob_intention_id is not null;

-- ============================================================================
-- 5. Row Level Security (RLS)
-- ============================================================================
-- Note: In Supabase, the server-side `service_role` key bypasses RLS
-- automatically. Public (`anon`) and logged-in (`authenticated`) clients
-- are strictly restricted by the policies below.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Categories: anyone can read active categories
create policy "Anyone can read active categories"
  on public.categories
  for select
  to anon, authenticated
  using (is_active = true);

-- Products: anyone can read active products
create policy "Anyone can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- Orders: logged-in customers can read ONLY their own orders
-- (No INSERT/UPDATE/DELETE policies -> only the server can write orders)
create policy "Customers can read own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Order Items: logged-in customers can read items ONLY for their own orders
-- (No INSERT/UPDATE/DELETE policies -> only the server can write order items)
create policy "Customers can read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- Payments: logged-in customers can read payment records ONLY for their own orders
-- (No INSERT/UPDATE/DELETE policies -> only the server can write payments)
create policy "Customers can read own payments"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = payments.order_id
        and o.user_id = (select auth.uid())
    )
  );
