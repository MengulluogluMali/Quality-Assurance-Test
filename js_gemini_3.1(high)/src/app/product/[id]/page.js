import { prisma } from "@/auth";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) notFound();

  return (
    <div className="container animate-fade-in" style={{padding: "4rem 0"}}>
      <Link href="/" style={{color: "var(--accent-primary)", marginBottom: "2rem", display: "inline-block"}}>&larr; Back to Store</Link>
      
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem"}}>
        <div className="glass" style={{aspectRatio: "1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)"}}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{width: "100%", height: "100%", objectFit: "cover"}} />
          ) : (
            <span style={{color: "var(--text-secondary)"}}>No Image Available</span>
          )}
        </div>
        
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
          {product.category && <span style={{color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "600"}}>{product.category}</span>}
          <h1 className="text-gradient" style={{fontSize: "2.5rem", fontWeight: "700", marginBottom: "1rem"}}>{product.name}</h1>
          <div style={{fontSize: "2rem", fontWeight: "700", marginBottom: "1.5rem"}}>${product.price.toFixed(2)}</div>
          
          <p style={{color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "1.125rem"}}>{product.description}</p>
          
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
