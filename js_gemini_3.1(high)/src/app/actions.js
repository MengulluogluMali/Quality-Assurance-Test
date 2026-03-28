"use server";

import { signIn, signOut } from "@/auth";

export async function login() {
  await signIn();
}

export async function logout() {
  await signOut();
}
