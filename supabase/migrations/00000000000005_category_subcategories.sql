-- ============================================================================
-- Category subcategories (one level deep).
-- A category with a non-null parent_id is a subcategory of a top-level
-- category. Deleting a parent promotes its children back to top-level
-- (on delete set null) rather than cascading, so subcategories and their
-- products are never silently destroyed. Depth is capped at one level in
-- application code (admin UI only offers parent_id-null categories as
-- parent choices) — no DB-level CHECK, since a same-table cross-row
-- constraint would need a trigger for negligible benefit at this scale.
-- ============================================================================

alter table categories
  add column parent_id uuid references categories(id) on delete set null;

create index categories_parent_idx on categories (restaurant_id, parent_id);
