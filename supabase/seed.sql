-- ============================================================================
-- Demo data for "Sabor Urbano" — a fictional modern restaurant.
-- Product photos are styled placeholders (placehold.co) tagged per dish/angle
-- so the gallery/carousel UI can be fully exercised; swap them for real photos
-- via the admin image uploader once real photography is available.
-- ============================================================================

-- Small seed-only helpers -----------------------------------------------------

create or replace function seed_get_ingredient(p_restaurant_id uuid, p_name text) returns uuid
language plpgsql as $$
declare v_id uuid;
begin
  select id into v_id from ingredients where restaurant_id = p_restaurant_id and name = p_name;
  if v_id is null then
    insert into ingredients (restaurant_id, name) values (p_restaurant_id, p_name) returning id into v_id;
  end if;
  return v_id;
end;
$$;

create or replace function seed_add_ingredients(p_restaurant_id uuid, p_product_id uuid, p_names text[]) returns void
language plpgsql as $$
declare n text;
begin
  foreach n in array p_names loop
    insert into product_ingredients (product_id, ingredient_id)
    values (p_product_id, seed_get_ingredient(p_restaurant_id, n));
  end loop;
end;
$$;

-- Lightens a #rrggbb hex color by `amount` per channel (clamped), so each photo in a
-- gallery gets a slightly different tone instead of every angle looking identical.
create or replace function seed_lighten(p_hex text, p_amount int) returns text
language plpgsql as $$
declare
  r int := least(255, ('x' || substr(p_hex, 1, 2))::bit(8)::int + p_amount);
  g int := least(255, ('x' || substr(p_hex, 3, 2))::bit(8)::int + p_amount);
  b int := least(255, ('x' || substr(p_hex, 5, 2))::bit(8)::int + p_amount);
begin
  return lpad(to_hex(r), 2, '0') || lpad(to_hex(g), 2, '0') || lpad(to_hex(b), 2, '0');
end;
$$;

create or replace function seed_add_images(p_product_id uuid, p_label text, p_bg text, p_fg text, p_angles text[]) returns void
language plpgsql as $$
declare
  angle text;
  i int := 0;
  tone text;
begin
  -- Plain color blocks (no baked-in text): the dish name/price already render as
  -- real HTML over these images, so burning text into the placeholder pixels would
  -- just duplicate and visually collide with it (placehold.co always renders *some*
  -- label — its own "WxH" default — unless fg exactly matches bg). alt_text still
  -- carries the label for accessibility. Each angle gets a slightly lighter tone so
  -- the gallery/carousel visibly changes photo to photo. Swap these for real
  -- photography via the admin image uploader once available.
  foreach angle in array p_angles loop
    tone := seed_lighten(p_bg, i * 14);
    insert into product_images (product_id, url, alt_text, is_primary, sort_order)
    values (
      p_product_id,
      format('https://placehold.co/1200x1200/%s/%s.png?text=%%20', tone, tone),
      format('%s — %s', p_label, angle),
      i = 0,
      i
    );
    i := i + 1;
  end loop;
end;
$$;

do $$
declare
  v_restaurant_id uuid;
  v_cat_entradas uuid;
  v_cat_fuertes uuid;
  v_cat_hamburguesas uuid;
  v_cat_sushi uuid;
  v_cat_pastas uuid;
  v_cat_postres uuid;
  v_cat_bebidas uuid;
  v_cat_limonadas uuid;
  v_cat_jugos uuid;
  v_cat_cervezas uuid;
  v_cat_refajos uuid;

  v_tag_picante uuid;
  v_tag_vegetariano uuid;
  v_tag_vegano uuid;
  v_tag_recomendado uuid;
  v_tag_bestseller uuid;
  v_tag_nuevo uuid;
  v_tag_frutos_secos uuid;
  v_tag_lacteos uuid;

  v_all_frutos_secos uuid;
  v_all_lacteos uuid;
  v_all_gluten uuid;
  v_all_mariscos uuid;
  v_all_huevo uuid;

  v_product_id uuid;
  v_option_id uuid;
begin
  -- --------------------------------------------------------------------------
  -- Restaurant + settings
  -- --------------------------------------------------------------------------
  insert into restaurants (slug, name) values ('sabor-urbano', 'Sabor Urbano')
  returning id into v_restaurant_id;

  insert into restaurant_settings (
    restaurant_id, tagline, description, primary_color, accent_color, font_family,
    theme_default, instagram_url, whatsapp_number, address, google_maps_url,
    currency, locale, hero_image_url, opening_hours
  ) values (
    v_restaurant_id,
    'Cocina de autor en el corazón de la ciudad',
    'Sabor Urbano combina técnicas contemporáneas con ingredientes locales de temporada. Un menú pensado para compartir, descubrir y disfrutar cada detalle.',
    '#171717', '#d97706', 'Inter', 'system',
    'https://instagram.com/saborurbano', '573001234567',
    'Carrera 11 # 93-45, Bogotá', 'https://maps.google.com/?q=Carrera+11+%2393-45+Bogota',
    'COP', 'es',
    'https://placehold.co/1600x900/1c1917/1c1917.png?text=%20',
    '{
      "mon": [{"open":"12:00","close":"22:00"}], "tue": [{"open":"12:00","close":"22:00"}],
      "wed": [{"open":"12:00","close":"22:00"}], "thu": [{"open":"12:00","close":"22:30"}],
      "fri": [{"open":"12:00","close":"23:30"}], "sat": [{"open":"12:00","close":"23:30"}],
      "sun": [{"open":"12:00","close":"21:00"}]
    }'::jsonb
  );

  -- --------------------------------------------------------------------------
  -- Categories
  -- --------------------------------------------------------------------------
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Entradas', 'entradas', 'Para abrir el apetito', '🥗', 0) returning id into v_cat_entradas;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Platos Fuertes', 'platos-fuertes', 'El protagonista de la mesa', '🍖', 1) returning id into v_cat_fuertes;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Hamburguesas', 'hamburguesas', 'Carne madurada y pan brioche artesanal', '🍔', 2) returning id into v_cat_hamburguesas;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Sushi', 'sushi', 'Frescura y precisión japonesa', '🍣', 3) returning id into v_cat_sushi;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Pastas', 'pastas', 'Pasta fresca hecha en casa', '🍝', 4) returning id into v_cat_pastas;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Postres', 'postres', 'El final perfecto', '🍰', 5) returning id into v_cat_postres;
  insert into categories (restaurant_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, 'Bebidas', 'bebidas', 'Para acompañar cada plato', '🥤', 6) returning id into v_cat_bebidas;
  insert into categories (restaurant_id, parent_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, v_cat_bebidas, 'Limonadas', 'limonadas', 'Limonadas naturales de la casa', '🍋', 0) returning id into v_cat_limonadas;
  insert into categories (restaurant_id, parent_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, v_cat_bebidas, 'Jugos naturales', 'jugos-naturales', 'Fruta fresca exprimida al momento', '🍊', 1) returning id into v_cat_jugos;
  insert into categories (restaurant_id, parent_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, v_cat_bebidas, 'Cervezas', 'cervezas', 'Selección nacional e importada', '🍺', 2) returning id into v_cat_cervezas;
  insert into categories (restaurant_id, parent_id, name, slug, description, icon, sort_order) values
    (v_restaurant_id, v_cat_bebidas, 'Refajos', 'refajos', 'La mezcla clásica colombiana', '🍹', 3) returning id into v_cat_refajos;

  -- --------------------------------------------------------------------------
  -- Tags & allergens
  -- --------------------------------------------------------------------------
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Picante', 'picante', '🌶') returning id into v_tag_picante;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Vegetariano', 'vegetariano', '🌱') returning id into v_tag_vegetariano;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Vegano', 'vegano', '🌿') returning id into v_tag_vegano;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Recomendado', 'recomendado', '⭐') returning id into v_tag_recomendado;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Más vendido', 'mas-vendido', '🔥') returning id into v_tag_bestseller;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Nuevo', 'nuevo', '🆕') returning id into v_tag_nuevo;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Contiene frutos secos', 'frutos-secos', '🥜') returning id into v_tag_frutos_secos;
  insert into tags (restaurant_id, name, slug, icon) values (v_restaurant_id, 'Contiene lácteos', 'lacteos', '🥛') returning id into v_tag_lacteos;

  insert into allergens (restaurant_id, name, icon) values (v_restaurant_id, 'Frutos secos', '🥜') returning id into v_all_frutos_secos;
  insert into allergens (restaurant_id, name, icon) values (v_restaurant_id, 'Lácteos', '🥛') returning id into v_all_lacteos;
  insert into allergens (restaurant_id, name, icon) values (v_restaurant_id, 'Gluten', '🌾') returning id into v_all_gluten;
  insert into allergens (restaurant_id, name, icon) values (v_restaurant_id, 'Mariscos', '🦐') returning id into v_all_mariscos;
  insert into allergens (restaurant_id, name, icon) values (v_restaurant_id, 'Huevo', '🥚') returning id into v_all_huevo;

  -- ==========================================================================
  -- ENTRADAS
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_featured, spice_level, sort_order)
  values (v_restaurant_id, v_cat_entradas, 'Tartar de Atún Rojo', 'tartar-de-atun-rojo',
    'Atún rojo, aguacate, sésamo tostado y aire de lima',
    'Cubos de atún rojo calidad sashimi marinados en soya y jengibre, sobre aguacate cremoso, coronados con sésamo tostado y un toque cítrico de lima. Servido con chips de plátano verde.',
    38000, 'published', true, 1, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Tartar de Atún', '1c1917', 'f2c879', array['Vista principal','Detalle del corte','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Atún rojo','Aguacate','Sésamo','Lima','Salsa de soya','Jengibre']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_recomendado);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_entradas, 'Croquetas de Jamón Ibérico', 'croquetas-jamon-iberico',
    'Cremosas por dentro, crujientes por fuera',
    'Bechamel de jamón ibérico curado 24 meses, empanizadas y fritas al momento. Seis unidades servidas con alioli de ajo negro.',
    26000, 'published', 0, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Croquetas Ibéricas', '292524', 'f2c879', array['Vista principal','Corte cremoso','Presentación completa','Detalle del empanizado']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Jamón ibérico','Leche','Harina de trigo','Ajo negro']);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten), (v_product_id, v_all_lacteos);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_lacteos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_new, spice_level, sort_order)
  values (v_restaurant_id, v_cat_entradas, 'Carpaccio de Res al Trufa', 'carpaccio-de-res-al-trufa',
    'Láminas finísimas, rúgula y aceite de trufa',
    'Lomo de res cortado en láminas muy finas, aliñado con aceite de oliva a la trufa negra, lascas de parmesano 24 meses, rúgula fresca y alcaparras.',
    42000, 'published', true, 0, 2)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Carpaccio de Res', '3f3226', 'f2c879', array['Vista principal','Vista superior','Detalle del corte']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Lomo de res','Parmesano','Rúgula','Aceite de trufa','Alcaparras']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_nuevo), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_entradas, 'Ceviche Clásico de Corvina', 'ceviche-clasico-de-corvina',
    'Leche de tigre, camote y choclo',
    'Corvina fresca marinada en leche de tigre de ají amarillo, cebolla morada, cilantro, camote glaseado y choclo peruano.',
    36000, 'published', true, 2, 3)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Ceviche de Corvina', '44352a', 'f2c879', array['Vista principal','Vista superior','Presentación completa','Detalle de acompañamientos']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Corvina','Limón','Ají amarillo','Cebolla morada','Camote','Choclo','Cilantro']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller), (v_product_id, v_tag_picante);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos);

  -- ==========================================================================
  -- PLATOS FUERTES
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_featured, is_chef_recommendation, spice_level, sort_order)
  values (v_restaurant_id, v_cat_fuertes, 'Lomo Trufado', 'lomo-trufado',
    'Lomo de res, puré trufado y reducción de vino tinto',
    'Lomo de res madurado 21 días a la parrilla, servido sobre puré de papa trufado y acompañado de una reducción de vino tinto. El plato insignia de la casa.',
    48000, 'published', true, true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Lomo Trufado', '1f1a17', 'f2c879', array['Vista frontal','Vista superior','Corte de la carne','Presentación completa','Detalle de acompañamientos']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Lomo de res','Papa','Trufa negra','Vino tinto','Mantequilla']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_recomendado), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos);

  insert into product_options (product_id, name, selection_type, is_required, sort_order) values (v_product_id, 'Término de carne', 'single', true, 0) returning id into v_option_id;
  insert into option_values (option_id, label, price_delta, is_default, sort_order) values
    (v_option_id, 'Azul', 0, false, 0), (v_option_id, 'Medio', 0, true, 1),
    (v_option_id, '3/4', 0, false, 2), (v_option_id, 'Bien asado', 0, false, 3);
  insert into product_options (product_id, name, selection_type, is_required, sort_order) values (v_product_id, 'Adiciones', 'multiple', false, 1) returning id into v_option_id;
  insert into option_values (option_id, label, price_delta, is_default, sort_order) values
    (v_option_id, 'Queso azul', 5000, false, 0), (v_option_id, 'Tocineta', 7000, false, 1), (v_option_id, 'Aguacate', 4000, false, 2);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_fuertes, 'Salmón a la Parrilla con Espárragos', 'salmon-parrilla-esparragos',
    'Salmón noruego, espárragos y beurre blanc',
    'Filete de salmón noruego a la parrilla, punto perfecto, servido con espárragos verdes salteados y salsa beurre blanc de mantequilla y limón.',
    45000, 'published', 0, 3)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Salmón a la Parrilla', '2b2118', 'f2c879', array['Vista principal','Vista superior','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Salmón','Espárragos','Mantequilla','Limón']);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos), (v_product_id, v_all_lacteos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_fuertes, 'Costillas BBQ Ahumadas 12 Horas', 'costillas-bbq-ahumadas',
    'Ahumadas lento, glaseadas en salsa BBQ de la casa',
    'Costillas de cerdo ahumadas durante 12 horas a fuego lento, glaseadas con salsa BBQ artesanal, servidas con coleslaw y papas rústicas.',
    52000, 'published', true, 1, 4)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Costillas BBQ', '1c1917', 'f2c879', array['Vista principal','Detalle del glaseado','Presentación completa','Corte']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Costilla de cerdo','Salsa BBQ','Repollo','Papa criolla']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_fuertes, 'Risotto de Hongos Silvestres', 'risotto-hongos-silvestres',
    'Arroz carnaroli, hongos silvestres y parmesano',
    'Risotto cremoso de arroz carnaroli cocinado a fuego lento con caldo de hongos, mezcla de hongos silvestres salteados y parmesano curado.',
    34000, 'published', 0, 5)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Risotto de Hongos', '292524', 'f2c879', array['Vista principal','Vista superior']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Arroz carnaroli','Hongos silvestres','Parmesano','Caldo de vegetales']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_vegetariano), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos);

  -- ==========================================================================
  -- HAMBURGUESAS
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_hamburguesas, 'Bacon Burger', 'bacon-burger',
    'Carne angus, doble tocineta y queso cheddar',
    'Carne de res angus 200g, doble tocineta crocante, queso cheddar madurado, cebolla caramelizada y salsa especial de la casa en pan brioche artesanal.',
    39000, 'published', true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Bacon Burger', '3f3226', 'f2c879', array['Vista principal','Corte transversal','Presentación completa','Detalle de ingredientes']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Carne angus','Tocineta','Queso cheddar','Cebolla caramelizada','Pan brioche']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten), (v_product_id, v_all_lacteos);

  insert into product_options (product_id, name, selection_type, is_required, sort_order) values (v_product_id, 'Adiciones', 'multiple', false, 0) returning id into v_option_id;
  insert into option_values (option_id, label, price_delta, is_default, sort_order) values
    (v_option_id, 'Queso extra', 5000, false, 0), (v_option_id, 'Tocineta extra', 7000, false, 1), (v_option_id, 'Aguacate', 4000, false, 2);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_hamburguesas, 'Classic Angus Burger', 'classic-angus-burger',
    'La receta original desde 1998',
    'Carne angus 180g, lechuga crocante, tomate, cebolla morada, pepinillos y salsa clásica en pan brioche.',
    32000, 'published', 0, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Classic Angus Burger', '44352a', 'f2c879', array['Vista principal','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Carne angus','Lechuga','Tomate','Cebolla morada','Pepinillos','Pan brioche']);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_new, spice_level, sort_order)
  values (v_restaurant_id, v_cat_hamburguesas, 'Veggie Burger de Garbanzo', 'veggie-burger-garbanzo',
    'Medallón de garbanzo y vegetales asados',
    'Medallón artesanal de garbanzo, quinoa y vegetales asados, hummus de la casa, rúgula y tomate confitado en pan integral.',
    30000, 'published', true, 0, 2)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Veggie Burger', '1f1a17', 'f2c879', array['Vista principal','Corte transversal','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Garbanzo','Quinoa','Hummus','Rúgula','Tomate confitado','Pan integral']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_vegano), (v_product_id, v_tag_nuevo);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten);

  -- ==========================================================================
  -- SUSHI
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_sushi, 'Sushi Roll California', 'sushi-roll-california',
    'Cangrejo, aguacate y pepino, envuelto en ajonjolí',
    'Clásico roll relleno de cangrejo, aguacate y pepino, envuelto en arroz de sushi y ajonjolí tostado. 8 piezas.',
    28000, 'published', true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Roll California', '2b2118', 'f2c879', array['Vista principal','Vista superior','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Cangrejo','Aguacate','Pepino','Arroz de sushi','Ajonjolí']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_featured, spice_level, sort_order)
  values (v_restaurant_id, v_cat_sushi, 'Nigiri Selección del Chef', 'nigiri-seleccion-del-chef',
    'Selección de 8 piezas del día',
    'Selección curada por el chef de ocho piezas de nigiri con los pescados más frescos del día: atún, salmón, pez mantequilla y camarón.',
    46000, 'published', true, 1, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Nigiri del Chef', '1c1917', 'f2c879', array['Vista principal','Vista superior','Detalle de cada pieza']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Atún','Salmón','Pez mantequilla','Camarón','Arroz de sushi']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_recomendado);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_sushi, 'Roll Tempura de Camarón', 'roll-tempura-de-camaron',
    'Camarón tempura, aguacate y salsa spicy mayo',
    'Roll frito con camarón tempura crocante, aguacate y queso crema, bañado en salsa spicy mayo y anguila.',
    31000, 'published', 2, 2)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Roll Tempura', '292524', 'f2c879', array['Vista principal','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Camarón','Aguacate','Queso crema','Salsa spicy mayo']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_picante), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_mariscos), (v_product_id, v_all_lacteos);

  -- ==========================================================================
  -- PASTAS
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_pastas, 'Fettuccine Alfredo con Pollo', 'fettuccine-alfredo-con-pollo',
    'Pasta fresca, salsa alfredo y pollo a la plancha',
    'Fettuccine fresco hecho en casa, en cremosa salsa alfredo de parmesano, con supremas de pollo a la plancha y un toque de nuez moscada.',
    33000, 'published', 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Fettuccine Alfredo', '3f3226', 'f2c879', array['Vista principal','Vista superior','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Fettuccine','Pollo','Crema de leche','Parmesano','Nuez moscada']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten), (v_product_id, v_all_lacteos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_new, spice_level, sort_order)
  values (v_restaurant_id, v_cat_pastas, 'Ravioles de Ricotta y Espinaca', 'ravioles-ricotta-espinaca',
    'Pasta rellena, mantequilla salvia y parmesano',
    'Ravioles artesanales rellenos de ricotta y espinaca fresca, bañados en mantequilla dorada con salvia y láminas de parmesano.',
    35000, 'published', true, 0, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Ravioles de Ricotta', '44352a', 'f2c879', array['Vista principal','Detalle del relleno','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Ricotta','Espinaca','Mantequilla','Salvia','Parmesano']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_vegetariano), (v_product_id, v_tag_nuevo), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten), (v_product_id, v_all_lacteos), (v_product_id, v_all_huevo);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_pastas, 'Spaghetti alla Carbonara', 'spaghetti-alla-carbonara',
    'Receta romana tradicional con guanciale',
    'Spaghetti al dente con guanciale crocante, yema de huevo, pecorino romano y abundante pimienta negra recién molida.',
    32000, 'published', true, 0, 2)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Spaghetti Carbonara', '1f1a17', 'f2c879', array['Vista principal','Vista superior','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Spaghetti','Guanciale','Huevo','Pecorino romano','Pimienta negra']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_gluten), (v_product_id, v_all_huevo), (v_product_id, v_all_lacteos);

  -- ==========================================================================
  -- POSTRES
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_postres, 'Volcán de Chocolate', 'volcan-de-chocolate',
    'Centro líquido, helado de vainilla',
    'Bizcocho de chocolate belga con centro líquido, servido caliente con una bola de helado artesanal de vainilla y frutos rojos.',
    22000, 'published', true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Volcán de Chocolate', '292524', 'f2c879', array['Vista principal','Corte con centro líquido','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Chocolate belga','Mantequilla','Huevo','Helado de vainilla']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos), (v_product_id, v_all_huevo), (v_product_id, v_all_gluten);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_postres, 'Tiramisú Clásico', 'tiramisu-clasico',
    'Receta italiana tradicional con mascarpone',
    'Capas de bizcocho savoiardi empapado en espresso, crema de mascarpone y cacao amargo espolvoreado. Receta de la nonna.',
    20000, 'published', 0, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Tiramisú Clásico', '3f3226', 'f2c879', array['Vista principal','Vista superior']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Mascarpone','Café espresso','Bizcocho savoiardi','Cacao']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos), (v_product_id, v_all_gluten), (v_product_id, v_all_huevo);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_new, spice_level, sort_order)
  values (v_restaurant_id, v_cat_postres, 'Cheesecake de Maracuyá', 'cheesecake-de-maracuya',
    'Base de galleta, queso crema y coulis de maracuyá',
    'Cheesecake horneado de queso crema sobre base de galleta, cubierto con un vibrante coulis de maracuyá fresco.',
    21000, 'published', true, 0, 2)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Cheesecake de Maracuyá', '44352a', 'f2c879', array['Vista principal','Corte','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Queso crema','Galleta','Maracuyá','Huevo']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_nuevo), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos), (v_product_id, v_all_gluten), (v_product_id, v_all_huevo);

  -- ==========================================================================
  -- BEBIDAS (Limonadas, Jugos naturales, Cervezas, Refajos)
  -- ==========================================================================

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_limonadas, 'Limonada Natural', 'limonada-natural',
    'Limón fresco, hierbabuena y un toque de panela',
    'Limonada preparada al momento con limón recién exprimido, hierbabuena fresca y un toque de panela.',
    9000, 'published', true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Limonada Natural', '3f5a3f', 'f2c879', array['Vista principal','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Limón','Hierbabuena','Panela']);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_new, spice_level, sort_order)
  values (v_restaurant_id, v_cat_limonadas, 'Limonada de Coco', 'limonada-de-coco',
    'Cremosa, con leche de coco',
    'Nuestra limonada natural batida con leche de coco para una versión cremosa y refrescante.',
    12000, 'published', true, 0, 1)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Limonada de Coco', '2f4a2f', 'f2c879', array['Vista principal','Presentación completa']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Limón','Leche de coco','Panela']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_nuevo), (v_product_id, v_tag_lacteos);
  insert into product_allergens (product_id, allergen_id) values (v_product_id, v_all_lacteos);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_jugos, 'Jugo de Naranja', 'jugo-de-naranja',
    'Exprimido al momento',
    'Jugo de naranja 100% natural, exprimido al momento en punto de venta.',
    8000, 'published', 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Jugo de Naranja', 'b45309', 'f2c879', array['Vista principal']);
  perform seed_add_ingredients(v_restaurant_id, v_product_id, array['Naranja']);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, spice_level, sort_order)
  values (v_restaurant_id, v_cat_cervezas, 'Cerveza Club Colombia', 'cerveza-club-colombia',
    'Botella 330ml, bien fría',
    'Cerveza lager nacional, servida bien fría en botella de 330ml.',
    10000, 'published', 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Cerveza Club Colombia', '3f3226', 'f2c879', array['Vista principal']);

  insert into products (restaurant_id, category_id, name, slug, short_description, description, price, status, is_bestseller, spice_level, sort_order)
  values (v_restaurant_id, v_cat_refajos, 'Refajo Clásico', 'refajo-clasico',
    'Cerveza con Colombiana, servido en jarra',
    'La mezcla clásica colombiana de cerveza con gaseosa Colombiana, servida bien fría en jarra.',
    14000, 'published', true, 0, 0)
  returning id into v_product_id;
  perform seed_add_images(v_product_id, 'Refajo Clásico', 'b45309', 'f2c879', array['Vista principal','Presentación completa']);
  insert into product_tags (product_id, tag_id) values (v_product_id, v_tag_bestseller);

  -- --------------------------------------------------------------------------
  -- Promotion example
  -- --------------------------------------------------------------------------
  insert into promotions (restaurant_id, title, description, image_url, starts_at, ends_at, status, display_type)
  values (
    v_restaurant_id,
    'Noche de Sushi 2x1',
    'Todos los rolls de sushi al 2x1, todos los martes de 6pm a 10pm.',
    'https://placehold.co/1600x800/44352a/44352a.png?text=%20',
    now() - interval '1 day',
    now() + interval '30 day',
    'active',
    'banner'
  );

  raise notice 'Seed completado: restaurante % con 11 categorías (6 principales + Bebidas y sus 4 subcategorías) y 25 platos', v_restaurant_id;
end $$;

-- Clean up seed-only helpers (idempotent — safe to leave, but keeps schema tidy)
drop function if exists seed_get_ingredient(uuid, text);
drop function if exists seed_add_ingredients(uuid, uuid, text[]);
drop function if exists seed_add_images(uuid, text, text, text, text[]);
drop function if exists seed_lighten(text, int);
