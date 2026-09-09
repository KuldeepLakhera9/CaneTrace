import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/auth";
import { UserSession } from "@/types";

export async function requireAdminSession(): Promise<{
  session: UserSession | null;
  errorResponse?: NextResponse;
}> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 401 }
      ),
    };
  }
  return { session };
}
