import "./globals.css";
import Script from "next/script";
export const metadata = {
  title: {
    default: "Mi aplicacion",
    template: "%s | Mi aplicacion",
  },
  description: "Descripción",
  icons: {
    icon: "/logo.png",
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.esm.js"
          type="module"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.js"
          noModule
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}