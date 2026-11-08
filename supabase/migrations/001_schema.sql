-- Emteyt: full schema. Run once in the Supabase SQL Editor.

-- ===== Roles =====
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
insert into profiles (id) select id from auth.users on conflict do nothing;  -- backfill existing users

-- ===== Catalog =====
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  slug text unique not null,
  image_url text,
  sort_order int default 0,
  is_active boolean default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  short_description text,
  description text,
  category_id uuid references categories on delete set null,
  price numeric(12,2) not null check (price >= 0),
  discount_price numeric(12,2) check (discount_price >= 0 and discount_price < price),
  colors text[] default '{}',
  sizes text[] default '{}',
  stock int not null default 0 check (stock >= 0),
  is_available boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  url text not null,
  sort_order int default 0
);
create index on products (category_id);
create index on products (is_featured) where is_featured;
create index on products (created_at desc);
create index on product_images (product_id, sort_order);

-- ===== Orders =====
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text,
  total numeric(12,2) not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','completed','cancelled')),
  created_at timestamptz default now()
);
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid references products on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  color text,
  size text
);
create index on orders (status, created_at desc);
create index on order_items (order_id);

-- ===== Settings (single row) =====
create table settings (
  id int primary key default 1 check (id = 1),
  store_name text default 'Emteyt',
  logo_url text,
  phone text,
  whatsapp text,
  description text,
  delivery_info text,
  instagram text, facebook text, tiktok text
);
insert into settings (id, store_name) values (1, 'Emteyt');

-- ===== Secure order creation: prices and stock come from the database =====
create or replace function create_order(
  p_name text, p_phone text, p_address text, p_notes text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_order uuid; v_total numeric := 0; v_item jsonb; v_prod products; v_qty int; v_num bigint;
begin
  if length(trim(p_name)) < 2 or length(trim(p_phone)) < 8 or length(trim(p_address)) < 3 then
    raise exception 'invalid customer data';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'invalid cart';
  end if;

  insert into orders (customer_name, phone, address, notes, total)
  values (trim(p_name), trim(p_phone), trim(p_address), nullif(trim(coalesce(p_notes,'')),''), 0)
  returning id, order_number into v_order, v_num;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_prod from products
      where id = (v_item->>'product_id')::uuid and is_available for update;
    if not found or v_qty < 1 or v_qty > 20 or v_prod.stock < v_qty then
      raise exception 'product unavailable: %', v_item->>'product_id';
    end if;
    update products set stock = stock - v_qty where id = v_prod.id;
    insert into order_items (order_id, product_id, product_name, unit_price, quantity, color, size)
    values (v_order, v_prod.id, v_prod.name_ar, coalesce(v_prod.discount_price, v_prod.price), v_qty,
            nullif(v_item->>'color',''), nullif(v_item->>'size',''));
    v_total := v_total + coalesce(v_prod.discount_price, v_prod.price) * v_qty;
  end loop;

  update orders set total = v_total where id = v_order;
  return jsonb_build_object('order_number', v_num, 'total', v_total);
end $$;
grant execute on function create_order to anon, authenticated;

-- ===== Admin status change; cancelling returns stock =====
create or replace function admin_set_order_status(p_order uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare v_old text; r record;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('pending','confirmed','processing','shipped','completed','cancelled') then
    raise exception 'invalid status';
  end if;
  select status into v_old from orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;
  if v_old = 'cancelled' then raise exception 'order already cancelled'; end if;
  if p_status = 'cancelled' then
    for r in select product_id, quantity from order_items where order_id = p_order and product_id is not null loop
      update products set stock = stock + r.quantity where id = r.product_id;
    end loop;
  end if;
  update orders set status = p_status where id = p_order;
end $$;
revoke all on function admin_set_order_status from public;
grant execute on function admin_set_order_status to authenticated;

-- ===== Best sellers (from real order quantities, cancelled orders excluded) =====
create or replace function best_sellers(p_limit int default 8)
returns table (product_id uuid)
language sql security definer stable set search_path = public as $$
  select oi.product_id
  from order_items oi
  join orders o on o.id = oi.order_id and o.status <> 'cancelled'
  join products p on p.id = oi.product_id and p.is_available
  group by oi.product_id
  order by sum(oi.quantity) desc
  limit p_limit;
$$;
grant execute on function best_sellers to anon, authenticated;

-- ===== Row Level Security =====
alter table profiles       enable row level security;
alter table categories     enable row level security;
alter table products       enable row level security;
alter table product_images enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table settings       enable row level security;

create policy "own profile read" on profiles for select using (id = auth.uid() or is_admin());

create policy "public read categories" on categories for select using (is_active or is_admin());
create policy "public read products"   on products   for select using (true);
create policy "public read images"     on product_images for select using (true);
create policy "public read settings"   on settings   for select using (true);

create policy "admin write categories" on categories      for all using (is_admin()) with check (is_admin());
create policy "admin write products"   on products        for all using (is_admin()) with check (is_admin());
create policy "admin write images"     on product_images  for all using (is_admin()) with check (is_admin());
create policy "admin update settings"  on settings        for update using (is_admin()) with check (is_admin());

create policy "admin read orders" on orders      for select using (is_admin());
create policy "admin read items"  on order_items for select using (is_admin());
-- No public INSERT/UPDATE on orders: only create_order() and admin_set_order_status() can write them.

-- ===== Storage =====
insert into storage.buckets (id, name, public) values ('product-images','product-images',true)
  on conflict (id) do nothing;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());
create policy "admin delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

-- ===== After signing up the owner in Supabase Auth, promote them: =====
-- update profiles set role = 'admin' where id = '<owner-uid>';
