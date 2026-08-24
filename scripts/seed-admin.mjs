// One-off setup script: creates the demo admin user in Supabase Auth and
// links it to the seeded restaurant via restaurant_admins.
// Usage: node scripts/seed-admin.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = "admin@saborurbano.com";
const ADMIN_PASSWORD = "SaborUrbano2026!";

async function main() {
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", env.NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG)
    .single();
  if (restaurantError) throw restaurantError;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  let userId = created?.user?.id;
  if (createError) {
    if (createError.message.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      userId = list.users.find((u) => u.email === ADMIN_EMAIL)?.id;
    } else {
      throw createError;
    }
  }
  if (!userId) throw new Error("No se pudo determinar el ID del usuario admin");

  const { error: membershipError } = await supabase
    .from("restaurant_admins")
    .upsert({ user_id: userId, restaurant_id: restaurant.id, role: "owner" }, { onConflict: "user_id,restaurant_id" });
  if (membershipError) throw membershipError;

  console.log("Admin listo:");
  console.log("  Email:   ", ADMIN_EMAIL);
  console.log("  Password:", ADMIN_PASSWORD);
  console.log("  Restaurant ID:", restaurant.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
