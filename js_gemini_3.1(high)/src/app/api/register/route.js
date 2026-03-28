import { prisma } from "@/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Admin setup hack: if env is set, make them admin
    const isAdminEmail = process.env.ADMIN_EMAIL === email;
    const role = isAdminEmail ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
