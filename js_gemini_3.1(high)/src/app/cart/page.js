"use client";

import { useCart } from "@/components/CartContext";
import { Trash2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, isLoaded } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total })
      });
      if (res.ok) {
        clearCart();
        alert("Purchase successful! You will receive an email shortly.");
        window.location.href = "/orders";
      } else {
         const err = await res.text();
         throw new Error(err || "Checkout failed");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
    setCheckingOut(false);
  };

  if (!isLoaded) return <div className="container" style={{padding: "4rem 0"}}>Loading cart...</div>;

  return (
    <div className="container animate-fade-in" style={{padding: "4rem 0"}}>
      <h1 className="text-gradient" style={{fontSize: "2.5rem", fontWeight: "700", marginBottom: "2rem"}}>Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div style={{textAlign: "center", padding: "4rem 0"}}>
          <p style={{color: "var(--text-secondary)", fontSize: "1.25rem", marginBottom: "2rem"}}>Your cart is empty.</p>
          <Link href="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem"}} className="cart-grid">
          <div>
            {cart.map(item => (
              <div key={item.id} className="glass" style={{display: "flex", gap: "1.5rem", padding: "1.5rem", marginBottom: "1rem", alignItems: "center"}}>
                <div style={{width: "80px", height: "80px", background: "var(--bg-secondary)", borderRadius: "8px", overflow: "hidden"}}>
                   {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width:"100%", height:"100%", objectFit:"cover"}} />}
                </div>
                <div style={{flex: 1}}>
                  <h3 style={{fontSize: "1.125rem", fontWeight: "600"}}>{item.name}</h3>
                  <p style={{color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem"}}>Qty: {item.quantity}</p>
                </div>
                <div style={{fontWeight: "700", fontSize: "1.125rem"}}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{color: "var(--error-color)", padding: "0.5rem"}}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="glass" style={{padding: "2rem", height: "fit-content"}}>
            <h2 style={{fontSize: "1.5rem", marginBottom: "1.5rem"}}>Order Summary</h2>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "var(--text-secondary)"}}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "var(--text-secondary)"}}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontSize: "1.25rem", fontWeight: "700"}}>
              <span>Total</span>
              <span className="text-gradient">${total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={checkingOut} 
              className="btn btn-primary" 
              style={{width: "100%", padding: "1rem"}}
            >
              <CreditCard size={20} /> {checkingOut ? "Processing..." : "Simulate Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
