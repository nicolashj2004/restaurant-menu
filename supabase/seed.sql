-- ============================================================================
-- Datos reales de "Mi Leña" — exportados desde la base de datos local con
-- `npx supabase db dump --local --data-only --schema public
--   -x public.restaurant_admins -x public.analytics_events`.
--
-- No incluye:
--   - restaurant_admins: cada persona crea su propio usuario admin local con
--     `node scripts/seed-admin.mjs` (está ligado a su propia instancia de
--     Supabase Auth, no es portable entre máquinas).
--   - analytics_events: datos de uso, no contenido del menú.
--   - Los archivos de imagen en Storage (solo quedan las URLs en
--     product_images; las 2 fotos del Volcán de Chocolate habría que
--     volver a subirlas desde el panel admin en la máquina nueva).
-- ============================================================================

SET session_replication_role = replica;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."restaurants" ("id", "slug", "name", "created_at", "updated_at") VALUES
	('32a2a05e-54bd-4002-96c1-065f857491bb', 'sabor-urbano', 'Mi Leña', '2026-08-24 21:30:39.994236+00', '2026-08-25 22:20:11.880662+00');


--
-- Data for Name: allergens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."allergens" ("id", "restaurant_id", "name", "icon") VALUES
	('995f5ade-12dc-4fbf-ae98-429403723b9c', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Frutos secos', '🥜'),
	('7af5f766-86e3-4c3d-858a-39c1708bf6c8', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Lácteos', '🥛'),
	('5cb81674-c6cf-4afd-9797-cc80a2a268a0', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Gluten', '🌾'),
	('2f9c370c-26ed-4fab-9bf2-360d0f79002e', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Mariscos', '🦐'),
	('37235843-086c-4371-b6f4-ed32529032c7', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Huevo', '🥚');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "restaurant_id", "name", "slug", "description", "image_url", "icon", "sort_order", "is_active", "created_at", "updated_at", "parent_id") VALUES
	('8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Entradas', 'entradas', 'Para abrir el apetito', NULL, '🥗', 0, true, '2026-08-24 21:30:39.994236+00', '2026-08-24 21:30:39.994236+00', NULL),
	('5745c1d0-de7e-4a3c-a1e9-71d8600fb124', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pescados', 'pescados', 'Comida de mar', NULL, '🐠', 0, true, '2026-08-24 23:15:40.826314+00', '2026-08-24 23:18:09.472053+00', NULL),
	('5361bdd5-eb62-4eb2-9e40-b5ec714d8291', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Especialidades', 'especialidades', 'El protagonista de la mesa', NULL, '⭐️', 1, true, '2026-08-24 21:30:39.994236+00', '2026-08-24 23:22:42.667287+00', NULL),
	('fa6ab4ed-0e50-43a8-b486-4dd4f495d7d4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Sopas', 'sopas', 'A leña (tradicionales sopas colombianas)', NULL, '🍲', 0, true, '2026-08-24 23:28:29.517465+00', '2026-08-24 23:28:29.517465+00', NULL),
	('f77735e4-4eca-4bf1-9af9-bb1b2d16fda4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pequeñitos', 'pequenitos', 'Para los consentidos de la casa', NULL, '👦🏻', 0, true, '2026-08-24 23:29:54.629865+00', '2026-08-24 23:29:54.629865+00', NULL),
	('3a708dec-4e94-4657-8070-a7481c19270c', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Asadas al Trompo', 'asadas', 'Carne típica llanera', NULL, '🥩', 5, true, '2026-08-24 21:30:39.994236+00', '2026-08-24 23:33:00.128494+00', NULL),
	('0202f4de-0797-44f5-a740-aa245a592e3f', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Otras Carnes', 'otras-carnes', 'Opciones alternativas', NULL, '🍖', 0, true, '2026-08-24 23:12:32.858316+00', '2026-08-24 23:33:09.074686+00', NULL),
	('aa66d154-1309-46b1-8310-536732a4fa71', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Charron', 'charron', 'Chicharron', NULL, '🐽', 0, true, '2026-08-24 23:38:20.553506+00', '2026-08-24 23:39:48.320238+00', NULL),
	('4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Bebidas', 'bebidas', '', NULL, '🍹', 0, true, '2026-08-25 00:15:29.042448+00', '2026-08-25 00:15:29.042448+00', NULL),
	('bb84da54-c3cd-491c-b056-b314efaeb065', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Con Alcohol', 'refajo', '', NULL, '🍻', 0, true, '2026-08-25 00:19:51.668896+00', '2026-08-25 01:00:13.200481+00', '4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4'),
	('d46ea45b-3de0-4891-bf90-cce6398803f9', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Limonadas', 'limonadas', '', NULL, '🍸', 0, true, '2026-08-25 01:01:18.817899+00', '2026-08-25 01:01:18.817899+00', '4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4'),
	('661d75f7-e44c-482e-97ee-3b5b31354e51', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Jugos', 'jugos', '', NULL, '🧃', 0, true, '2026-08-25 01:00:39.921808+00', '2026-08-25 01:01:28.263173+00', '4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4'),
	('bf10af50-0e38-4603-adf3-4a6f91f2bfaa', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cervezas', 'cervezas', '', NULL, '🍺', 0, true, '2026-08-25 22:03:15.848558+00', '2026-08-25 22:03:15.848558+00', '4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4');


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."ingredients" ("id", "restaurant_id", "name") VALUES
	('6404f968-6f2f-46be-b37e-52db727acb37', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Atún rojo'),
	('133cd1b8-aa4a-49c5-99cb-ed795a983ac3', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Aguacate'),
	('36533681-d68b-4b52-b6c0-47fefe9e318a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Sésamo'),
	('58b2dc3d-3b49-458a-8a73-4f3c388a14a3', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Lima'),
	('c8de53c6-eb31-4a4a-b4f8-899211d3eb65', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Salsa de soya'),
	('6203c87f-ab14-421d-9dca-a3a38e3bbcf3', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Jengibre'),
	('0abcc0ae-456e-4352-961d-fbf1fadb918a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Jamón ibérico'),
	('e5a4b202-54d4-496c-a597-7b323973084f', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Leche'),
	('5f017771-9598-45b4-9998-f98afdf0cb5d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Harina de trigo'),
	('f76b1139-a002-49a8-b672-8cc43d7ed117', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Ajo negro'),
	('659b712d-c192-4897-9c04-8d4c7cf99aa2', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Lomo de res'),
	('4f28a1b4-92f8-4a62-baf8-1ef0bd33fd9d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Parmesano'),
	('0288fbb4-cf13-49e9-9a97-cc85e661188d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Rúgula'),
	('268b300a-0344-4712-8292-ad32354158e5', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Aceite de trufa'),
	('231a4732-2d66-47b7-9312-a840e9054ad6', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Alcaparras'),
	('21f87801-9b55-4276-b7ae-2c7f33466c45', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Corvina'),
	('9b3abbab-90e4-4cb3-9f9f-0d9592ab9f06', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Limón'),
	('df60300c-2845-4818-9f2c-8648cafc0f23', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Ají amarillo'),
	('143d3512-ef04-4920-9303-c14f1d882064', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cebolla morada'),
	('3423e82f-5eb3-4f06-bb12-2f71fbcb0c25', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Camote'),
	('7a84be8e-4328-44a1-9ce9-9117463d3c24', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Choclo'),
	('5c0c2857-80c6-4757-b5a5-cad5af48c167', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cilantro'),
	('f476e12f-fa51-4a4c-910f-8b46c30b6b22', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Papa'),
	('afd17acb-4978-45d9-a319-b7a6c95f3398', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Trufa negra'),
	('e54bfb4a-79d7-4ee6-9aae-33da2479b976', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Vino tinto'),
	('ea50f502-008a-4c91-bb32-c9e616cc6c2e', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Mantequilla'),
	('f927263d-00fd-4724-b28a-ee272e1a5ea6', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Salmón'),
	('a3e9b2df-c26e-4bc9-977b-ae26bc8aea2d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Espárragos'),
	('528ff452-bb60-4043-aa6e-39a3aacabe86', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Costilla de cerdo'),
	('c119b4d7-8120-428f-8c17-ca6ac49dca33', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Salsa BBQ'),
	('0217ae93-dc93-42c9-86a4-cf655a5a360f', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Repollo'),
	('b147cb7d-6546-49c2-9f83-6f49fc57ff83', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Papa criolla'),
	('94f836b3-96c2-4700-b8eb-cce423e6676b', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Arroz carnaroli'),
	('1ab621c2-fa07-41c5-9034-68b515f9fcc7', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Hongos silvestres'),
	('325acdd3-f8be-40aa-81b2-9e9edbfd7a3f', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Caldo de vegetales'),
	('78bd920d-8ca8-4e5b-83ed-5f84c4475ccb', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Carne angus'),
	('389f0cda-3de2-40a0-94da-4eb76a15899a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Tocineta'),
	('d1681ed7-5ab1-49a4-bae2-71f4ad642a78', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Queso cheddar'),
	('8cf02cef-d686-41a6-813c-21e7c3814c11', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cebolla caramelizada'),
	('1a1889fe-4eb9-4b56-9842-cb41b67c9777', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pan brioche'),
	('83c91393-09c4-4c4d-a13b-e551fe4b5dd1', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Lechuga'),
	('dbab3170-6ad4-4901-b85d-42e29598f134', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Tomate'),
	('29811e09-5d28-4cda-abe1-ea8c6a6bac5e', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pepinillos'),
	('176c25ca-ddeb-4575-8ba0-4ca7c3268df8', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Garbanzo'),
	('d2091748-13e0-4f13-b9dc-735fb66fb2b5', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Quinoa'),
	('45b59c9b-325a-43d6-9553-c38dca116e2a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Hummus'),
	('f953e983-882f-43cd-8ef0-b619e733cdbc', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Tomate confitado'),
	('e3ad66ab-5fc3-48c0-bb91-e54357ca9792', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pan integral'),
	('778cbcb6-41a3-4368-885d-00da3f2f5a30', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cangrejo'),
	('54cffdb2-0cad-4786-b66d-a50481339058', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pepino'),
	('82e7bf7c-d0aa-4075-9e50-9d90bd117e5c', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Arroz de sushi'),
	('e23ecef4-8c56-4f22-a091-dffe9694ceea', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Ajonjolí'),
	('da4fc291-df7e-4743-af1a-517c3e6f9b84', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Atún'),
	('7e35f11a-3ebf-4b66-a6db-b1ac159a697a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pez mantequilla'),
	('cf380167-a3ad-4ee2-b5fd-c2f29394b602', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Camarón'),
	('fe2ecb43-8756-4249-ae82-913d25f34ef4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Queso crema'),
	('5f25a7aa-65c4-46c1-8c1f-daed3c44e9bb', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Salsa spicy mayo'),
	('6f74a29a-9bd1-4194-979d-b3168ac6eaba', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Fettuccine'),
	('03f76710-3dba-47b3-89ab-8af32f4f70c6', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pollo'),
	('d4ddfbed-9a1b-415a-98d6-1baf3a50ae09', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Crema de leche'),
	('fc45dd86-1929-45dc-b593-4ed659e5b46c', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Nuez moscada'),
	('01a83ab7-b7f2-4f3c-89b2-0f664e157835', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Ricotta'),
	('dec75531-7d14-4694-8131-eb819cbee240', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Espinaca'),
	('4c3de2e6-b15c-491b-8709-da9f0fe14cf8', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Salvia'),
	('5a1069a2-e74a-4720-9973-977d0d96461b', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Spaghetti'),
	('a098e063-0c47-488b-b496-f772b3a46544', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Guanciale'),
	('80b1be28-a616-4fbe-8a56-782490f10cf4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Huevo'),
	('e44dfe9b-09a2-463b-bafd-d7261e46c073', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pecorino romano'),
	('c8c3bd78-3fce-4e7a-9ce1-2cf81fd0bfa7', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Pimienta negra'),
	('ea677515-0420-4529-8532-593a2cea95dc', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Chocolate belga'),
	('bad1bdac-aab8-47a5-b3d9-82fbd536e8cd', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Helado de vainilla'),
	('66b0d28b-967d-4f52-8d8c-23e1e422343a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Mascarpone'),
	('ac718832-b3e0-4ad3-a226-e6d65d21c683', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Café espresso'),
	('7ad02dcf-2259-49aa-b7b6-f6def5445a1e', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Bizcocho savoiardi'),
	('f7f13ce7-f522-448e-9dee-fb776f690257', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Cacao'),
	('8c968052-c2cf-4192-9761-7db5cca02e0d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Galleta'),
	('7cef7817-9852-433b-86b9-673efaa9562c', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Maracuyá');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "restaurant_id", "category_id", "name", "slug", "short_description", "description", "price", "status", "is_available", "is_featured", "is_new", "is_bestseller", "is_chef_recommendation", "spice_level", "sort_order", "created_at", "updated_at") VALUES
	('3852a06d-244e-4c31-973d-925f663b76b3', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Volcán de Chocolate', 'volcan-de-chocolate', 'Centro líquido, helado de vainilla', 'Bizcocho de chocolate belga con centro líquido, servido caliente con una bola de helado artesanal de vainilla y frutos rojos.', 22000.00, 'published', true, false, false, true, false, 0, 0, '2026-08-24 21:30:39.994236+00', '2026-08-24 22:08:24.948777+00'),
	('a83b5a04-68f2-4e17-8b06-e19eb051e7e8', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Morizo', 'morizo', '', '', 13000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:03:26.78019+00', '2026-08-24 23:04:02.042533+00'),
	('b2050ef5-6798-4595-899b-ea11b372ad8c', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Morcilla', 'morcilla', '', '', 11900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:05:26.082274+00', '2026-08-24 23:07:37.854088+00'),
	('1400bcdc-3e8f-4d2d-a58c-b980a1e601ff', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Chorizo', 'chorizo', 'Acompáñado de papa criolla y guacamole', '', 17900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:08:31.415677+00', '2026-08-24 23:09:57.429827+00'),
	('eeef0263-8760-4cdc-9a1e-b36738a33ba0', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Chicharron Carnudo (Panceta)', 'chicharron-carnudo-panceta', '', '', 24000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:08:57.865487+00', '2026-08-24 23:10:04.518052+00'),
	('da40bb3b-088d-4194-a1dd-61b760990513', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Limón Charrón (Lomo con chicharrón)', 'limon-charron-lomo-con-chicharron', 'Acompáñado de patacón y guacamole', '', 21900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:09:45.7108+00', '2026-08-24 23:10:13.097441+00'),
	('1e45d8a6-7083-43ad-803b-7b6a77fd38ee', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Arepa de la casa', 'arepa-de-la-casa', '', '', 3200.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:10:35.578877+00', '2026-08-24 23:10:35.578877+00'),
	('3d808fef-0bcf-4f5d-a82e-4c23cdaafb5c', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Patacones Leños', 'patacones-lenos', '', '', 17900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:11:00.725294+00', '2026-08-24 23:11:00.725294+00'),
	('4928ac11-0b48-419b-8853-1d4998f52d9c', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Patacones crujientes', 'patacones-crujientes', '', '', 11900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:11:27.452211+00', '2026-08-24 23:11:27.452211+00'),
	('159f0333-7bea-4110-bf06-b7ec589c457c', '32a2a05e-54bd-4002-96c1-065f857491bb', '0202f4de-0797-44f5-a740-aa245a592e3f', 'Filete De Pollo Gratinado', 'filete-de-pollo-gratinado', '', '', 45000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:13:18.890224+00', '2026-08-24 23:13:18.890224+00'),
	('673d0444-3f80-4652-bcca-5d9368c1b242', '32a2a05e-54bd-4002-96c1-065f857491bb', '0202f4de-0797-44f5-a740-aa245a592e3f', 'Filete De Pollo a la Brasa', 'filete-de-pollo-a-la-brasa', '', '', 40000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:13:42.250973+00', '2026-08-24 23:13:42.250973+00'),
	('74be8916-289c-4d52-865d-0d1a787de7b3', '32a2a05e-54bd-4002-96c1-065f857491bb', '0202f4de-0797-44f5-a740-aa245a592e3f', 'Filete de Pollo en Salsa de Champiñones', 'filete-de-pollo-en-salsa-de-champinones', 'Acompáñado de papa en casco, patacón y ensalada', '', 46000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:14:21.955426+00', '2026-08-24 23:14:21.955426+00'),
	('dc6061df-2db0-4eab-9340-cb0ddb83943a', '32a2a05e-54bd-4002-96c1-065f857491bb', '0202f4de-0797-44f5-a740-aa245a592e3f', 'Costillas BBQ', 'costillas-bbq', 'Acompáñamiento papa encasco, patacón, ensalada y yuca o patacón, francesa y ensalada', '', 40500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:15:24.057653+00', '2026-08-24 23:15:24.057653+00'),
	('e415a34a-d8f3-4835-9397-c65368b29e65', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Mojarra a la Brasa o Frita', 'mojarra-a-la-brasa-o-frita', '', '', 49900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:16:25.064187+00', '2026-08-24 23:16:25.064187+00'),
	('67d82fbe-9165-4692-97d7-f8426369faa3', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Trucha a la Brasa', 'trucha-a-la-brasa', '', '', 46550.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:16:47.701408+00', '2026-08-24 23:16:47.701408+00'),
	('31c29dc0-4f66-48fd-9a0b-eb04c44aaac6', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Trucha al Ajillo', 'trucha-al-ajillo', '', '', 46550.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:17:12.558347+00', '2026-08-24 23:17:12.558347+00'),
	('dc73d3db-8e39-4f82-8ee3-367f32893289', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Trucha en Salsa de Champiñones ', 'trucha-en-salsa-de-champinones', '', '', 46500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:17:34.952289+00', '2026-08-24 23:17:54.091999+00'),
	('e72b3ff6-6ae6-4804-8bfa-74af141f4b3f', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Salmon', 'salmon', '', '', 57900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:18:56.098936+00', '2026-08-24 23:18:56.098936+00'),
	('8dcc686d-9f1e-4767-85ff-b277799fe0fb', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Filete de Pescado', 'filete-de-pescado', '', '', 41900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:19:19.750765+00', '2026-08-24 23:19:19.750765+00'),
	('a607d998-03e6-43f4-960c-d6c5e85236ef', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Filete en Salsa de Champiñones', 'filete-en-salsa-de-champinones', '', '', 46900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:21:11.256864+00', '2026-08-24 23:21:11.256864+00'),
	('d319e16d-0412-40e8-bd0f-340d3ad095b0', '32a2a05e-54bd-4002-96c1-065f857491bb', '5745c1d0-de7e-4a3c-a1e9-71d8600fb124', 'Charron de Pescado', 'charron-de-pescado', 'Acompañado con papa en casco, patacón, ensalada y arroz.', '', 41900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:22:07.599601+00', '2026-08-24 23:22:07.599601+00'),
	('885e5705-e641-430c-9cb1-3f6539def347', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Ojo de Bife', 'ojo-de-bife', '', '', 59900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:23:06.536793+00', '2026-08-24 23:23:06.536793+00'),
	('a3986e22-45bf-431e-a4cb-ff0685087843', '32a2a05e-54bd-4002-96c1-065f857491bb', NULL, 'Churrasco 400g', 'churrasco-400g', '', '', 59900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:23:38.926866+00', '2026-08-24 23:23:38.926866+00'),
	('94326d57-6678-4f2d-a42d-10ad5a64ac00', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Churrasco 300g ', 'churrasco-400g-copia-mt7v4c2r', '', '', 47900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:23:51.462053+00', '2026-08-24 23:24:18.006902+00'),
	('923d8dd8-e67b-4cd9-9c1e-837b385520db', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Punta de Anca 400g', 'punta-de-anca-400g', '', '', 63900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:24:51.690924+00', '2026-08-24 23:24:51.690924+00'),
	('a970b918-dc85-4bc6-9b85-6ffabb79ce09', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Punta de Anca 300g', 'punta-de-anca-300g', '', '', 54900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:25:20.104491+00', '2026-08-24 23:25:20.104491+00'),
	('b42d2c5c-7f11-496d-b441-256b1743893c', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'T-Bone Steak', 't-bone-steak', '', '', 79900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:25:54.380949+00', '2026-08-24 23:25:54.380949+00'),
	('b3b381bb-07ca-4a1f-8ddd-28feddfa9876', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Baby Beef', 'baby-beef', '', '', 63900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:26:15.336579+00', '2026-08-24 23:26:15.336579+00'),
	('07445cb3-e985-4f1f-82e0-54c214dd0947', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Carne de Res', 'carne-de-res', '', '', 43900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:26:38.172745+00', '2026-08-24 23:26:38.172745+00'),
	('5e831490-f0ba-4379-b22b-ccbd7f03fb7d', '32a2a05e-54bd-4002-96c1-065f857491bb', '5361bdd5-eb62-4eb2-9e40-b5ec714d8291', 'Lomo de Cerdo ', 'lomo-de-cerdo', '', '', 40500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:27:02.534035+00', '2026-08-24 23:27:02.534035+00'),
	('1ce25d73-38b7-40cd-bbce-2113ab310540', '32a2a05e-54bd-4002-96c1-065f857491bb', 'fa6ab4ed-0e50-43a8-b486-4dd4f495d7d4', 'Especial', 'especial', '', '', 21900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:28:47.316232+00', '2026-08-24 23:28:47.316232+00'),
	('272560a8-53ab-4957-962c-adc34c51d22d', '32a2a05e-54bd-4002-96c1-065f857491bb', 'fa6ab4ed-0e50-43a8-b486-4dd4f495d7d4', 'Sopa de Entrada', 'sopa-de-entrada', '', '', 11900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:29:07.4315+00', '2026-08-24 23:29:07.4315+00'),
	('1c962bac-5663-4396-9ca6-c5119e3e7c2a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'f77735e4-4eca-4bf1-9af9-bb1b2d16fda4', 'Nuggets de Pollo', 'nuggets-de-pollo', 'Acompañados de papa en casco y una sopa de ajiaco (16 Oz) + jugo de caja (200ml)', '', 25900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:31:07.963571+00', '2026-08-24 23:31:07.963571+00'),
	('f55cae41-98f8-4f2c-a00c-d06894429681', '32a2a05e-54bd-4002-96c1-065f857491bb', 'f77735e4-4eca-4bf1-9af9-bb1b2d16fda4', 'Hamburguesa de Res', 'hamburguesa-de-res', 'Mini hamburguesa acompañado de papa a la francesa + jugo', '', 25900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:31:49.275697+00', '2026-08-24 23:32:02.013226+00'),
	('27502ba8-e5ee-4435-83bf-b0539ef345d1', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Llanerada Mixta', 'llanerada-mixta', '', '', 41300.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:33:31.893395+00', '2026-08-24 23:33:31.893395+00'),
	('c6e8f0e1-d8cd-405c-b286-f6974d248bbe', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Llanerada y Res', 'llanerada-y-res', '', '', 43200.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:33:53.431214+00', '2026-08-24 23:33:53.431214+00'),
	('2a7e219a-1de0-4d23-89d3-c5523d825313', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Llanerada Especial Pa 2', 'llanerada-especial-pa-2', '', '', 69900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:34:21.131188+00', '2026-08-24 23:34:21.131188+00'),
	('4be199f7-6ead-461c-88ad-06af34fae979', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Carne a la Mamona', 'carne-a-la-mamona', '', '', 41000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:34:48.661017+00', '2026-08-24 23:34:48.661017+00'),
	('e686da0d-0ec6-4828-a4cf-48a7eba72e01', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Carne a la Ternera', 'carne-a-la-ternera', '', '', 41000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:35:14.202353+00', '2026-08-24 23:35:14.202353+00'),
	('f86ca77c-f8cd-4fe2-9309-cf5f18603cac', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Carne a la Chiguire', 'carne-a-la-chiguire', '', '', 40500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:35:42.150678+00', '2026-08-24 23:35:42.150678+00'),
	('de28cb53-4be6-45f4-971a-852dab0a8d01', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Costilla a la Llanera', 'costilla-a-la-llanera', 'Con papa salada, platano, arepa campesina y guacamole', '', 42000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:36:07.23243+00', '2026-08-24 23:36:29.600083+00'),
	('74344207-d27e-4c25-a59d-f5749b98b101', '32a2a05e-54bd-4002-96c1-065f857491bb', '3a708dec-4e94-4657-8070-a7481c19270c', 'Tradicionales de 400g', 'tradicionales-de-400g', '4 carnes tradicionales en variedad de carnes de Chigüiro, mamona, ternera y costilla de ternera', '', 0.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:37:53.526154+00', '2026-08-24 23:37:53.526154+00'),
	('58cd5b0c-2026-4a1c-bcff-102d93656dcc', '32a2a05e-54bd-4002-96c1-065f857491bb', 'aa66d154-1309-46b1-8310-536732a4fa71', 'Charron Charron', 'charron-charron', '', '', 46000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:38:58.614025+00', '2026-08-24 23:38:58.614025+00'),
	('428ca807-355d-41f9-9387-c41cc2b136a4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'aa66d154-1309-46b1-8310-536732a4fa71', 'Charron Llanero', 'charron-llanero', '', '', 43800.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:39:19.744618+00', '2026-08-24 23:39:19.744618+00'),
	('12b48165-75ee-4eef-9e51-206a0df54af1', '32a2a05e-54bd-4002-96c1-065f857491bb', '8e0c0d71-059b-4e8f-bb9a-5adfd3a6e5bd', 'Chunchullo', 'chunchullo', '', '', 23900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-24 23:11:47.532885+00', '2026-08-25 00:13:09.85246+00'),
	('d1200456-660e-497d-988d-f6309dbee228', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'De Panela', 'de-panela', '', '', 7900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:01:49.922281+00', '2026-08-25 01:01:49.922281+00'),
	('4b8067ed-5e20-48e9-b056-cb19ac38ca21', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'De Hierbabuena', 'de-hierbabuena', '', '', 7900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:14:02.556678+00', '2026-08-25 01:14:02.556678+00'),
	('6909b561-0a12-4e17-9813-ba3647a98a4b', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'Natural', 'natural', '', '', 5500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:14:38.757725+00', '2026-08-25 01:14:38.757725+00'),
	('41de08d4-7c27-4660-a50c-b668531b3973', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'De Cereza', 'de-cereza', '', '', 8500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:14:55.390277+00', '2026-08-25 01:14:55.390277+00'),
	('878260e5-7470-478a-b2ff-5332b5a6eea5', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'Granizada', 'granizada', '', '', 5800.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:15:15.196141+00', '2026-08-25 01:15:15.196141+00'),
	('6da6ec03-6516-4c4a-aa74-4975a215d277', '32a2a05e-54bd-4002-96c1-065f857491bb', 'd46ea45b-3de0-4891-bf90-cce6398803f9', 'De Coco', 'de-coco', '', '', 8500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:15:32.3173+00', '2026-08-25 01:15:32.3173+00'),
	('b39a2680-503f-4f19-915b-5d25befc5c5c', '32a2a05e-54bd-4002-96c1-065f857491bb', '661d75f7-e44c-482e-97ee-3b5b31354e51', 'En Leche', 'en-leche', 'Maracuya, lulo, guanábana, mora, fresa y mango', '', 9500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:16:40.232999+00', '2026-08-25 01:16:40.232999+00'),
	('499e1277-1da2-4861-a33e-32d0458ee7d4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'bf10af50-0e38-4603-adf3-4a6f91f2bfaa', 'Aguila Light', 'aguila-light', '', '', 6600.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:03:39.581835+00', '2026-08-25 22:03:39.581835+00'),
	('8ea4b983-dc18-42a7-8656-e99963bc5ca5', '32a2a05e-54bd-4002-96c1-065f857491bb', 'bf10af50-0e38-4603-adf3-4a6f91f2bfaa', 'Club Colombia Dorada/Roja', 'club-colombia-dorada-roja', '', '', 7500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:04:02.348675+00', '2026-08-25 22:04:02.348675+00'),
	('550cfdbd-7251-46de-add0-b1bdfd3fcbf7', '32a2a05e-54bd-4002-96c1-065f857491bb', '4b6441a5-d4b2-42ac-95e0-0acb3f6e73d4', 'Agua', 'agua', '', '', 4500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:04:25.3547+00', '2026-08-25 22:04:25.3547+00'),
	('b5f89027-a35c-43a1-b267-ac9c7584d138', '32a2a05e-54bd-4002-96c1-065f857491bb', 'bf10af50-0e38-4603-adf3-4a6f91f2bfaa', 'Corona/Stella', 'corona-stella', '', '', 11500.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:04:47.177267+00', '2026-08-25 22:04:47.177267+00'),
	('045d7e80-694b-4417-a600-53c5a411d406', '32a2a05e-54bd-4002-96c1-065f857491bb', 'bf10af50-0e38-4603-adf3-4a6f91f2bfaa', 'Poker/Aguila', 'poker-aguila', '', '', 6000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:05:07.115186+00', '2026-08-25 22:05:07.115186+00'),
	('377a0b9f-910d-4872-a5a4-f78dd5e24573', '32a2a05e-54bd-4002-96c1-065f857491bb', '661d75f7-e44c-482e-97ee-3b5b31354e51', 'En Agua', 'en-agua', 'Maracuya, lulo, guanábana, mora, fresa y mango', '', 7900.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 01:17:21.856431+00', '2026-08-25 22:05:50.591447+00'),
	('c4bea07d-8662-4019-95da-0b2e0c004147', '32a2a05e-54bd-4002-96c1-065f857491bb', 'bb84da54-c3cd-491c-b056-b314efaeb065', 'Refajo', 'refajo', '', 'Licor: Colombiana - Malta - Antioqueño
Para dos: 15.000 - 16.000 - 16.000
Con licor: 9.000 + 9.000 + 9.000', 15000.00, 'published', true, false, false, false, false, 0, 0, '2026-08-25 22:09:43.644715+00', '2026-08-25 22:37:02.037141+00');


--
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_allergens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_allergens" ("product_id", "allergen_id") VALUES
	('3852a06d-244e-4c31-973d-925f663b76b3', '7af5f766-86e3-4c3d-858a-39c1708bf6c8'),
	('3852a06d-244e-4c31-973d-925f663b76b3', '37235843-086c-4371-b6f4-ed32529032c7'),
	('3852a06d-244e-4c31-973d-925f663b76b3', '5cb81674-c6cf-4afd-9797-cc80a2a268a0');


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_images" ("id", "product_id", "url", "alt_text", "is_primary", "sort_order", "created_at") VALUES
	('b9a4d889-24c5-47c6-907b-34e88c8aea65', '3852a06d-244e-4c31-973d-925f663b76b3', 'http://127.0.0.1:54321/storage/v1/object/public/menu-images/32a2a05e-54bd-4002-96c1-065f857491bb/products/3852a06d-244e-4c31-973d-925f663b76b3/0d798059-2d95-424b-bc35-d6d62f704e85.jpeg', 'volcan', true, 0, '2026-08-24 21:43:20.799943+00'),
	('872f7392-40f1-4287-b22f-c6c89d64c82c', '3852a06d-244e-4c31-973d-925f663b76b3', 'http://127.0.0.1:54321/storage/v1/object/public/menu-images/32a2a05e-54bd-4002-96c1-065f857491bb/products/3852a06d-244e-4c31-973d-925f663b76b3/15016aa3-fc59-4897-ac05-17ab308852bc.jpeg', 'BandejaPaisa', false, 1, '2026-08-24 22:08:21.993838+00');


--
-- Data for Name: product_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_ingredients" ("product_id", "ingredient_id") VALUES
	('3852a06d-244e-4c31-973d-925f663b76b3', 'ea677515-0420-4529-8532-593a2cea95dc'),
	('3852a06d-244e-4c31-973d-925f663b76b3', 'ea50f502-008a-4c91-bb32-c9e616cc6c2e'),
	('3852a06d-244e-4c31-973d-925f663b76b3', '80b1be28-a616-4fbe-8a56-782490f10cf4'),
	('3852a06d-244e-4c31-973d-925f663b76b3', 'bad1bdac-aab8-47a5-b3d9-82fbd536e8cd');


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "restaurant_id", "name", "slug", "icon") VALUES
	('66c4111a-783e-419d-8170-2eafcb79e518', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Picante', 'picante', '🌶'),
	('11853644-56d4-4f58-81c2-0e2673459b99', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Vegetariano', 'vegetariano', '🌱'),
	('bf30a7da-549e-401e-8647-7ef2a534aae4', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Vegano', 'vegano', '🌿'),
	('d7d3b907-5b2b-4a03-810f-bb8ef299353a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Recomendado', 'recomendado', '⭐'),
	('bd285bed-e607-4bc3-9110-1d4ce88ae53f', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Más vendido', 'mas-vendido', '🔥'),
	('66cb8cc2-3244-4597-83f4-8fee568c3522', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Nuevo', 'nuevo', '🆕'),
	('3ddad9ee-1f94-4eaa-b416-5aeb23fa2d3a', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Contiene frutos secos', 'frutos-secos', '🥜'),
	('ca93737e-d4ce-4388-b58e-8630dc36aec1', '32a2a05e-54bd-4002-96c1-065f857491bb', 'Contiene lácteos', 'lacteos', '🥛');


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_tags" ("product_id", "tag_id") VALUES
	('3852a06d-244e-4c31-973d-925f663b76b3', 'bd285bed-e607-4bc3-9110-1d4ce88ae53f'),
	('3852a06d-244e-4c31-973d-925f663b76b3', 'ca93737e-d4ce-4388-b58e-8630dc36aec1'),
	('74344207-d27e-4c25-a59d-f5749b98b101', 'd7d3b907-5b2b-4a03-810f-bb8ef299353a');


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: restaurant_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."restaurant_settings" ("restaurant_id", "logo_url", "favicon_url", "hero_image_url", "hero_video_url", "tagline", "description", "primary_color", "accent_color", "font_family", "theme_default", "instagram_url", "whatsapp_number", "address", "google_maps_url", "currency", "locale", "opening_hours", "updated_at") VALUES
	('32a2a05e-54bd-4002-96c1-065f857491bb', NULL, NULL, 'https://placehold.co/1600x900/1c1917/1c1917.png?text=%20', NULL, 'Cocina de autor en el corazón de la ciudad', 'Sabor Urbano combina técnicas contemporáneas con ingredientes locales de temporada. Un menú pensado para compartir, descubrir y disfrutar cada detalle.', '#171717', '#d97706', 'Inter', 'system', 'https://instagram.com/saborurbano', '573001234567', 'Carrera 11 # 93-45, Bogotá', 'https://maps.google.com/?q=Carrera+11+%2393-45+Bogota', 'COP', 'es', '{"fri": [{"open": "12:00", "close": "23:30"}], "mon": [{"open": "12:00", "close": "22:00"}], "sat": [{"open": "12:00", "close": "23:30"}], "sun": [{"open": "12:00", "close": "21:00"}], "thu": [{"open": "12:00", "close": "22:30"}], "tue": [{"open": "12:00", "close": "22:00"}], "wed": [{"open": "12:00", "close": "22:00"}]}', '2026-08-25 22:20:11.887469+00');


--
-- PostgreSQL database dump complete
--


RESET ALL;
