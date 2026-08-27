import type { Metadata, Viewport } from "next";
import { Inter, Pacifico, Playfair_Display, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Loaded as --font-inter (not --font-sans directly) so it can act as the site-wide
// default while still being one of several options restaurants can pick from in
// Configuración → Apariencia → Tipografía (see app/menu/layout.tsx, which sets the
// actual --font-sans for the public menu based on the chosen restaurant_settings.font_family).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// A second body-font option offered in the admin's Tipografía picker.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Used specifically for the menu's category/subcategory names (Entradas, Pescados, ...) —
// matches the bold red brush script used on the restaurant's printed/Canva menu.
// Pacifico ships a single weight, so it's fixed here (not variable like the other fonts).
const pacifico = Pacifico({
  weight: "400",
  variable: "--font-category",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Menú Digital",
    template: "%s",
  },
  description: "Menú digital premium e interactivo.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${poppins.variable} ${pacifico.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
