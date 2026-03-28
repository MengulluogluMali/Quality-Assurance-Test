import { prisma } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container animate-fade-in" style={{padding: "4rem 0"}}>
      <h1 className="text-gradient" style={{fontSize: "2.5rem", fontWeight: "700", marginBottom: "2rem"}}>Order History</h1>
      
      {orders.length === 0 ? (
        <p style={{color: "var(--text-secondary)"}}>You haven't placed any orders yet.</p>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
          {orders.map(order => (
            <div key={order.id} className="glass" style={{padding: "1.5rem"}}>
              <div style={{display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem"}}>
                <div>
                  <p style={{fontSize: "0.875rem", color: "var(--text-secondary)"}}>Order #{order.id}</p>
                  <p style={{fontWeight: "500", marginTop: "0.25rem"}}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{textAlign: "right"}}>
                  <p style={{color: "var(--accent-primary)", fontWeight: "600", textTransform: "uppercase", fontSize: "0.875rem"}}>{order.status}</p>
                  <p style={{fontSize: "1.25rem", fontWeight: "700", marginTop: "0.25rem"}}>${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                {order.items.map(item => (
                   <div key={item.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                     <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                        <div style={{width: "48px", height: "48px", background: "var(--bg-secondary)", borderRadius: "6px", overflow: "hidden"}}>
                           {item.product?.imageUrl && <img src={item.product.imageUrl} style={{width:"100%", height:"100%", objectFit:"cover"}}/>}
                        </div>
                        <div>
                           <p style={{fontWeight: "500"}}>{item.product?.name || "Unknown Product"}</p>
                           <p style={{fontSize: "0.875rem", color: "var(--text-secondary)"}}>Qty: {item.quantity}</p>
                        </div>
                     </div>
                     <div style={{fontWeight: "500"}}>
                        ${((item.price) * item.quantity).toFixed(2)}
                     </div>
                   </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
