import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {

    const stats = await DataStore.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Dashboard Stats Error]:", error);
    return NextResponse.json(
      { error: "Failed to compute dashboard metrics" },
      { status: 500 }
    );
  }
}
