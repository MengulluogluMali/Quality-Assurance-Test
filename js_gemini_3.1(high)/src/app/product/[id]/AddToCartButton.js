"use client";

import { useCart } from "@/components/CartContext";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd} 
      className="btn btn-primary" 
      style={{
        marginTop: "1.5rem", 
        width: "100%", 
        padding: "1rem", 
        fontSize: "1.125rem",
        background: added ? "var(--success-color)" : "",
        boxShadow: added ? "none" : ""
      }}
    >
      <ShoppingCart size={20} /> {added ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
