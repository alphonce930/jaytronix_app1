create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  price numeric not null,
  category text not null check (category in ('Phones', 'Accessories')),
  short_description text not null,
  description text not null,
  images text[] not null default '{}',
  video_url text,
  available boolean not null default true,
  featured boolean not null default false,
  is_new boolean not null default false,
  specifications jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin')
);

do $$
declare
  primary_key_name text;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admins'
      and column_name = 'firebase_uid'
  ) then
    alter table public.admins alter column firebase_uid drop not null;
    alter table public.admins
      add column if not exists user_id uuid references auth.users(id) on delete cascade;

    select constraint_row.conname
    into primary_key_name
    from pg_constraint as constraint_row
    join pg_attribute as column_row
      on column_row.attrelid = constraint_row.conrelid
      and column_row.attnum = any(constraint_row.conkey)
    where constraint_row.conrelid = 'public.admins'::regclass
      and constraint_row.contype = 'p'
      and column_row.attname = 'firebase_uid';

    if primary_key_name is not null then
      execute format('alter table public.admins drop constraint %I', primary_key_name);
    end if;

    create unique index if not exists admins_user_id_unique
      on public.admins (user_id);
  end if;
end
$$;

alter table public.products enable row level security;
alter table public.admins enable row level security;

revoke all privileges on public.products, public.admins from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.admins to authenticated;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'role') = 'authenticated'
    and
    exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (
    (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (
    (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Admins can check their own access" on public.admins;
create policy "Admins can check their own access"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('product-media', 'product-media', true, 20971520)
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "Product media is publicly readable" on storage.objects;
create policy "Product media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "Admins can upload product media" on storage.objects;
create policy "Admins can upload product media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = 'products'
    and (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Admins can update product media" on storage.objects;
create policy "Admins can update product media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = 'products'
    and (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = 'products'
    and (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Admins can delete product media" on storage.objects;
create policy "Admins can delete product media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = 'products'
    and (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1 from public.admins
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );
