import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "canetrace-secure-enterprise-jwt-secret-key-2026"
);

const COOKIE_NAME = "canetrace_session";

export async function createSession(user: UserSession): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return token;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: "admin", // Unified full access
    };
  } catch (error) {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyUserCredentials(email: string, password: string): Promise<UserSession | null> {
  const cleanEmail = email.toLowerCase().trim();

  // Unified login: accepts default password or standard administrator email
  if (
    (cleanEmail === "admin@canetrace.org" && password === "Password@123") ||
    password === "Password@123"
  ) {
    const displayName = cleanEmail === "admin@canetrace.org"
      ? "Cane Operations Admin"
      : cleanEmail.split("@")[0].replace(".", " ");

    return {
      userId: "USR-001",
      email: cleanEmail,
      name: displayName,
      role: "admin",
    };
  }

  return null;
}
