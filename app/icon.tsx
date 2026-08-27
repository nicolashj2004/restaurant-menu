import { ImageResponse } from "next/og";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const restaurant = await getCurrentRestaurant();
  const settings = restaurant ? await getRestaurantSettings(restaurant.id) : null;

  return new ImageResponse(
    settings?.favicon_url ? (
      // Rendered by Satori (ImageResponse) server-side, not the browser — next/image doesn't apply here.
      <img
        src={settings.favicon_url}
        width={size.width}
        height={size.height}
        style={{ objectFit: "cover" }}
        alt=""
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#f2c879",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        {restaurant?.name?.trim().charAt(0).toUpperCase() || "M"}
      </div>
    ),
    { ...size }
  );
}
