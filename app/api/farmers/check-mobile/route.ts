import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      return NextResponse.json(
        { error: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    const existingFarmer = await DataStore.findFarmerByMobile(mobile.trim());

    if (existingFarmer) {
      return NextResponse.json({
        exists: true,
        farmer: {
          farmerId: existingFarmer.farmerId,
          farmerName: existingFarmer.farmerName,
          mobile: existingFarmer.mobile,
          village: existingFarmer.location.village,
          taluka: existingFarmer.location.taluka,
          district: existingFarmer.location.district,
          state: existingFarmer.location.state,
        },
      });
    }

    return NextResponse.json({ exists: false, farmer: null });
  } catch (error) {
    console.error("[Check Mobile Error]:", error);
    return NextResponse.json(
      { error: "Failed to check mobile duplicate" },
      { status: 500 }
    );
  }
}
