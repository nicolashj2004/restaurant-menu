-- ============================================================================
-- Promotion discounts + shareable slugs.
-- A promotion can optionally carry a discount (percentage or fixed amount)
-- applied to every product linked to it via promotion_products. Nullable —
-- a promotion can still be a plain informational banner with no discount.
-- The slug gives it its own public page at /menu/promociones/[slug].
-- ============================================================================

alter table promotions
  add column slug text,
  add column discount_type text check (discount_type in ('percentage', 'fixed_amount')),
  add column discount_value numeric(10, 2) check (discount_value >= 0);

create unique index promotions_restaurant_slug_key on promotions (restaurant_id, slug) where slug is not null;
