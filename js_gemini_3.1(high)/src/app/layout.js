import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/components/CartContext";

export const metadata = {
  title: "Aura Accessories | Premium Mobile Gear",
  description: "Find the best premium mobile cases, chargers, and accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer style={{ borderTop: "1px solid var(--border-color)", padding: "2rem 0", textAlign: "center", marginTop: "auto", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            &copy; {new Date().getFullYear()} Aura Accessories. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
