import { auth } from "@/auth";
import { prisma } from "@/auth";
import { redirect } from "next/navigation";
import AddProductForm from "./AddProductForm";
import { deleteProduct } from "./actions";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/"); 
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container animate-fade-in" style={{padding: "2rem 0"}}>
      <h1 className="text-gradient" style={{fontSize: "2.5rem", marginBottom: "2rem"}}>Admin Dashboard</h1>
      
      <AddProductForm />

      <h2 style={{fontSize: "1.5rem", marginBottom: "1rem"}}>Current Products</h2>
      
      {products.length === 0 ? (
        <p style={{color: "var(--text-secondary)"}}>No products available. Create one above.</p>
      ) : (
        <div style={{overflowX: "auto"}}>
          <table className="admin-table glass">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{width: "60px"}}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px"}} />
                    ) : (
                      <div style={{width: "48px", height: "48px", background: "var(--bg-secondary)", borderRadius: "8px"}}></div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.category || '-'}</td>
                  <td>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="btn btn-outline" style={{padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderColor: "var(--error-color)", color: "var(--error-color)"}}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
