import { NextRequest, NextResponse } from "next/server";
import { lookupPincode } from "@/lib/services/pincode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await params;
    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    const result = await lookupPincode(pincode);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Pincode API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve pincode details" },
      { status: 500 }
    );
  }
}
