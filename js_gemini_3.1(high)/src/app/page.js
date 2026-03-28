import { prisma } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container animate-fade-in">
      <header style={{ padding: "4rem 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "1rem" }} className="text-gradient">
          Elevate Your Mobile Experience
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>
          Discover our premium collection of cases, chargers, and accessories crafted for the modern device.
        </p>
      </header>

      <section className="grid-products">
        {products.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-secondary)", padding: "4rem 0", fontSize: "1.125rem" }}>
            No products available yet. Check back soon.
          </p>
        ) : (
          products.map(product => (
            <Link href={`/product/${product.id}`} key={product.id} className="product-card glass">
              <div className="product-image-container">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{color: 'var(--text-secondary)'}}>No Image</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                {product.category ? <span className="product-category">{product.category}</span> : <div style={{height: "1.2rem"}}></div>}
                <h3 className="product-title">{product.name}</h3>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: "1rem" }}>
                  <span className="product-price" style={{marginBottom: 0}}>${product.price.toFixed(2)}</span>
                  <span className="btn btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
                    View
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
