"use server";

import { prisma } from "@/auth";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addProduct(formData) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name");
  const description = formData.get("description");
  // ensure price is a valid float
  const price = parseFloat(formData.get("price"));
  const imageUrl = formData.get("imageUrl");
  const category = formData.get("category");

  if (!name || isNaN(price)) {
    throw new Error("Invalid Input");
  }

  await prisma.product.create({
    data: { name, description, price, imageUrl, category }
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(formData) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id");
  if (!id) throw new Error("ID missing");

  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
}
