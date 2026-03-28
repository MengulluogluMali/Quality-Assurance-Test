import { prisma } from "@/auth";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123"); 

export async function POST(req) {
  try {
    const session = await auth();
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    let verifiedTotal = 0;
    const orderItemsData = [];
    
    for (const item of items) {
       const product = await prisma.product.findUnique({ where: { id: item.id } });
       if (!product) continue;
       verifiedTotal += product.price * item.quantity;
       orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
       });
    }

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        guestEmail: session ? null : "guest@example.com",
        total: verifiedTotal,
        status: "COMPLETED", 
        items: {
          create: orderItemsData
        }
      }
    });

    // Send Notification
    try {
      if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
         await resend.emails.send({
            from: "Aura <onboarding@resend.dev>",
            to: process.env.ADMIN_EMAIL,
            subject: "New Aura Accessories Order: $" + verifiedTotal.toFixed(2),
            html: `<p>Great news! A new order (<strong>#${order.id}</strong>) was just placed for <strong>$${verifiedTotal.toFixed(2)}</strong>.</p><p>Check your admin dashboard for details.</p>`
         });
      } else {
         console.log(`[SIMULATED NOTIFICATION] New Order #${order.id} for $${verifiedTotal.toFixed(2)}`);
      }
    } catch (e) {
      console.error("Email sending failed:", e);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('CHECKOUT_ERROR', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
