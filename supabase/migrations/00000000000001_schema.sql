-- ============================================================================
-- Restaurant Menu SaaS — core schema
-- Multi-tenant: every content table carries restaurant_id.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- restaurant_settings (1:1 with restaurants) — everything customizable
-- ---------------------------------------------------------------------------
create table restaurant_settings (
  restaurant_id uuid primary key references restaurants(id) on delete cascade,
  logo_url text,
  favicon_url text,
  hero_image_url text,
  hero_video_url text,
  tagline text,
  description text,
  primary_color text not null default '#171717',
  accent_color text not null default '#d97706',
  font_family text not null default 'Inter',
  theme_default text not null default 'light' check (theme_default in ('light', 'dark', 'system')),
  instagram_url text,
  whatsapp_number text,
  address text,
  google_maps_url text,
  currency text not null default 'COP',
  locale text not null default 'es',
  opening_hours jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- restaurant_admins — links auth.users to a restaurant (multi-tenant auth)
-- ---------------------------------------------------------------------------
create table restaurant_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz not null default now(),
  unique (user_id, restaurant_id)
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug)
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  price numeric(10, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_chef_recommendation boolean not null default false,
  spice_level int not null default 0 check (spice_level between 0 and 3),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug)
);

create index products_restaurant_category_idx on products (restaurant_id, category_id);
create index products_status_idx on products (restaurant_id, status);

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on product_images (product_id);

-- ---------------------------------------------------------------------------
-- ingredients (per restaurant, reusable)
-- ---------------------------------------------------------------------------
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  unique (restaurant_id, name)
);

create table product_ingredients (
  product_id uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  primary key (product_id, ingredient_id)
);

-- ---------------------------------------------------------------------------
-- tags (e.g. Picante, Vegetariano, Vegano, Recomendado, Más vendido, Nuevo)
-- ---------------------------------------------------------------------------
create table tags (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,
  unique (restaurant_id, slug)
);

create table product_tags (
  product_id uuid not null references products(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- allergens (e.g. Frutos secos, Lácteos, Gluten)
-- ---------------------------------------------------------------------------
create table allergens (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  icon text,
  unique (restaurant_id, name)
);

create table product_allergens (
  product_id uuid not null references products(id) on delete cascade,
  allergen_id uuid not null references allergens(id) on delete cascade,
  primary key (product_id, allergen_id)
);

-- ---------------------------------------------------------------------------
-- product_options / option_values (Tamaño, Término, Adiciones ...)
-- ---------------------------------------------------------------------------
create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  selection_type text not null default 'single' check (selection_type in ('single', 'multiple')),
  is_required boolean not null default false,
  sort_order int not null default 0
);

create table option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options(id) on delete cascade,
  label text not null,
  price_delta numeric(10, 2) not null default 0,
  is_default boolean not null default false,
  sort_order int not null default 0
);

create index product_options_product_idx on product_options (product_id);
create index option_values_option_idx on option_values (option_id);

-- ---------------------------------------------------------------------------
-- promotions
-- ---------------------------------------------------------------------------
create table promotions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired')),
  display_type text not null default 'banner' check (display_type in ('banner', 'carousel', 'popup', 'card')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promotion_products (
  promotion_id uuid not null references promotions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (promotion_id, product_id)
);

-- ---------------------------------------------------------------------------
-- analytics_events — anonymous, no PII
-- ---------------------------------------------------------------------------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  event_type text not null check (
    event_type in ('menu_open', 'view_category', 'view_product', 'click_product', 'view_featured')
  ),
  category_id uuid references categories(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index analytics_events_restaurant_idx on analytics_events (restaurant_id, event_type, created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_restaurants_updated_at before update on restaurants
  for each row execute function set_updated_at();
create trigger trg_restaurant_settings_updated_at before update on restaurant_settings
  for each row execute function set_updated_at();
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_promotions_updated_at before update on promotions
  for each row execute function set_updated_at();
