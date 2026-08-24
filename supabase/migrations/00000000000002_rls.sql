-- ============================================================================
-- Row Level Security
-- Public (anon/authenticated-not-admin): read published/active content only.
-- Admins: full CRUD scoped to the restaurant(s) they belong to.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- helper: is the current user an admin of a given restaurant?
-- security definer to avoid recursive RLS lookups on restaurant_admins.
-- ---------------------------------------------------------------------------
create or replace function is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from restaurant_admins ra
    where ra.restaurant_id = target_restaurant_id
      and ra.user_id = auth.uid()
  );
$$;

alter table restaurants enable row level security;
alter table restaurant_settings enable row level security;
alter table restaurant_admins enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table ingredients enable row level security;
alter table product_ingredients enable row level security;
alter table tags enable row level security;
alter table product_tags enable row level security;
alter table allergens enable row level security;
alter table product_allergens enable row level security;
alter table product_options enable row level security;
alter table option_values enable row level security;
alter table promotions enable row level security;
alter table promotion_products enable row level security;
alter table analytics_events enable row level security;

-- restaurants ----------------------------------------------------------------
create policy "public read restaurants" on restaurants for select using (true);
create policy "admin manage own restaurant" on restaurants for all
  using (is_restaurant_admin(id)) with check (is_restaurant_admin(id));

-- restaurant_settings ----------------------------------------------------------
create policy "public read settings" on restaurant_settings for select using (true);
create policy "admin manage own settings" on restaurant_settings for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

-- restaurant_admins --------------------------------------------------------
create policy "admin read own membership" on restaurant_admins for select
  using (is_restaurant_admin(restaurant_id));
create policy "owner manage admins" on restaurant_admins for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

-- categories -----------------------------------------------------------------
create policy "public read active categories" on categories for select
  using (is_active = true or is_restaurant_admin(restaurant_id));
create policy "admin manage own categories" on categories for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

-- products ---------------------------------------------------------------------
create policy "public read published products" on products for select
  using (status = 'published' or is_restaurant_admin(restaurant_id));
create policy "admin manage own products" on products for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

-- product_images -----------------------------------------------------------
create policy "public read product images" on product_images for select
  using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
        and (p.status = 'published' or is_restaurant_admin(p.restaurant_id))
    )
  );
create policy "admin manage product images" on product_images for all
  using (
    exists (select 1 from products p where p.id = product_images.product_id and is_restaurant_admin(p.restaurant_id))
  )
  with check (
    exists (select 1 from products p where p.id = product_images.product_id and is_restaurant_admin(p.restaurant_id))
  );

-- ingredients ----------------------------------------------------------------
create policy "public read ingredients" on ingredients for select using (true);
create policy "admin manage ingredients" on ingredients for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

create policy "public read product_ingredients" on product_ingredients for select using (true);
create policy "admin manage product_ingredients" on product_ingredients for all
  using (exists (select 1 from products p where p.id = product_ingredients.product_id and is_restaurant_admin(p.restaurant_id)))
  with check (exists (select 1 from products p where p.id = product_ingredients.product_id and is_restaurant_admin(p.restaurant_id)));

-- tags -------------------------------------------------------------------------
create policy "public read tags" on tags for select using (true);
create policy "admin manage tags" on tags for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

create policy "public read product_tags" on product_tags for select using (true);
create policy "admin manage product_tags" on product_tags for all
  using (exists (select 1 from products p where p.id = product_tags.product_id and is_restaurant_admin(p.restaurant_id)))
  with check (exists (select 1 from products p where p.id = product_tags.product_id and is_restaurant_admin(p.restaurant_id)));

-- allergens ----------------------------------------------------------------
create policy "public read allergens" on allergens for select using (true);
create policy "admin manage allergens" on allergens for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

create policy "public read product_allergens" on product_allergens for select using (true);
create policy "admin manage product_allergens" on product_allergens for all
  using (exists (select 1 from products p where p.id = product_allergens.product_id and is_restaurant_admin(p.restaurant_id)))
  with check (exists (select 1 from products p where p.id = product_allergens.product_id and is_restaurant_admin(p.restaurant_id)));

-- product_options / option_values -------------------------------------------
create policy "public read product_options" on product_options for select
  using (exists (select 1 from products p where p.id = product_options.product_id and (p.status = 'published' or is_restaurant_admin(p.restaurant_id))));
create policy "admin manage product_options" on product_options for all
  using (exists (select 1 from products p where p.id = product_options.product_id and is_restaurant_admin(p.restaurant_id)))
  with check (exists (select 1 from products p where p.id = product_options.product_id and is_restaurant_admin(p.restaurant_id)));

create policy "public read option_values" on option_values for select
  using (exists (
    select 1 from product_options po join products p on p.id = po.product_id
    where po.id = option_values.option_id and (p.status = 'published' or is_restaurant_admin(p.restaurant_id))
  ));
create policy "admin manage option_values" on option_values for all
  using (exists (
    select 1 from product_options po join products p on p.id = po.product_id
    where po.id = option_values.option_id and is_restaurant_admin(p.restaurant_id)
  ))
  with check (exists (
    select 1 from product_options po join products p on p.id = po.product_id
    where po.id = option_values.option_id and is_restaurant_admin(p.restaurant_id)
  ));

-- promotions -----------------------------------------------------------------
create policy "public read active promotions" on promotions for select
  using (status = 'active' or is_restaurant_admin(restaurant_id));
create policy "admin manage promotions" on promotions for all
  using (is_restaurant_admin(restaurant_id)) with check (is_restaurant_admin(restaurant_id));

create policy "public read promotion_products" on promotion_products for select using (true);
create policy "admin manage promotion_products" on promotion_products for all
  using (exists (select 1 from promotions pr where pr.id = promotion_products.promotion_id and is_restaurant_admin(pr.restaurant_id)))
  with check (exists (select 1 from promotions pr where pr.id = promotion_products.promotion_id and is_restaurant_admin(pr.restaurant_id)));

-- analytics_events -----------------------------------------------------------
-- anonymous clients may INSERT only (no read/update/delete of others' data)
create policy "anyone can log analytics" on analytics_events for insert
  with check (true);
create policy "admin read own analytics" on analytics_events for select
  using (is_restaurant_admin(restaurant_id));
