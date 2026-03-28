import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import { ShoppingCart, LogIn, LogOut, Package } from "lucide-react";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo">
          <Package style={{ color: "var(--accent-primary)" }} size={28} />
          <span>Aura<span style={{ color: "var(--accent-primary)" }}>.</span></span>
        </Link>
        <div className="nav-links">
          <Link href="/cart" className="nav-link" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <ShoppingCart size={20} /> Cart
          </Link>
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="nav-link">Admin</Link>
              )}
              <Link href="/orders" className="nav-link">Orders</Link>
              <form action={logout}>
                <button type="submit" className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                  <LogOut size={16} /> Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
