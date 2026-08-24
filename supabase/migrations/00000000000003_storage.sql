-- ============================================================================
-- Storage bucket for menu images (products, categories, restaurant branding)
-- Path convention: {restaurant_id}/products/{product_id}/{filename}
--                   {restaurant_id}/branding/{filename}
--                   {restaurant_id}/categories/{category_id}/{filename}
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "public read menu images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "admin upload menu images"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images'
    and is_restaurant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "admin update menu images"
  on storage.objects for update
  using (
    bucket_id = 'menu-images'
    and is_restaurant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "admin delete menu images"
  on storage.objects for delete
  using (
    bucket_id = 'menu-images'
    and is_restaurant_admin(((storage.foldername(name))[1])::uuid)
  );
