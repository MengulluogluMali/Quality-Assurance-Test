"use client";

import { useState } from "react";
import { addProduct } from "./actions";

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      await addProduct(formData);
      e.target.reset(); // clear form
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "2rem", marginBottom: "3rem" }} className="glass">
      <h2 style={{fontSize: "1.5rem", marginBottom: "1rem"}}>Add New Product</h2>
      
      <input type="text" name="name" placeholder="Product Name" required className="input" />
      
      <textarea name="description" placeholder="Description" required className="input" rows={3}></textarea>
      
      <div style={{display: "flex", gap: "1rem"}}>
        <input type="number" name="price" placeholder="Price ($)" step="0.01" required className="input" />
        <input type="text" name="category" placeholder="Category (e.g., Case, Charger)" className="input" />
      </div>

      <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="input" />
      
      <button type="submit" disabled={loading} className="btn btn-primary" style={{marginTop: "1rem"}}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
