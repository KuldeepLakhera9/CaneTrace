import { NextResponse } from "next/server";
import { verifyUserCredentials, createSession } from "@/lib/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUserCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Use demo credentials shown on the login page." },
        { status: 401 }
      );
    }

    await createSession(user);

    return NextResponse.json({
      success: true,
      user,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
