import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const farmer = await DataStore.findFarmerById(id);

    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    const cultivations = await DataStore.getCultivationsForFarmer(id);

    return NextResponse.json({
      farmer,
      cultivations,
    });
  } catch (error) {
    console.error("[Farmer Details GET Error]:", error);
    return NextResponse.json({ error: "Failed to load farmer details" }, { status: 500 });
  }
}
