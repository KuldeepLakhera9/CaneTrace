import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "canetrace-secure-enterprise-jwt-secret-key-2026"
);

const COOKIE_NAME = "canetrace_session";

// Demo credentials for quick login and testing
export const DEMO_USERS = [
  {
    userId: "USR-001",
    email: "admin@canetrace.org",
    password: "Password@123",
    name: "Dr. Vikram Deshpande",
    role: "admin" as const,
  },
  {
    userId: "USR-002",
    email: "officer@canetrace.org",
    password: "Password@123",
    name: "Sunil Kulkarni (Field Officer)",
    role: "employee" as const,
  },
];

export async function createSession(user: UserSession): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
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
      role: payload.role as "admin" | "employee",
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
  const found = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );

  if (found) {
    return {
      userId: found.userId,
      email: found.email,
      name: found.name,
      role: found.role,
    };
  }

  return null;
}
