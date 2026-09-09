import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";

export async function GET() {
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
