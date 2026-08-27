import { ImageResponse } from "next/og";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";

export async function GET() {
  const restaurant = await getCurrentRestaurant();
  const settings = restaurant ? await getRestaurantSettings(restaurant.id) : null;

  if (settings?.favicon_url) {
    // Proxy the uploaded favicon's actual bytes instead of round-tripping it through
    // Satori/ImageResponse — it's already the square image the admin uploader produces
    // (SingleImageUploader with aspect="aspect-square"), so no re-render is needed.
    const upstream = await fetch(settings.favicon_url);
    if (upstream.ok) {
      return new Response(upstream.body, {
        headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "image/png" },
      });
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#f2c879",
          fontSize: 260,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        {restaurant?.name?.trim().charAt(0).toUpperCase() || "M"}
      </div>
    ),
    { width: 512, height: 512 }
  );
}
