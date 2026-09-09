import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { farmerRegistrationSchema } from "@/lib/validations/farmer";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const district = searchParams.get("district") || "";
    const taluka = searchParams.get("taluka") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await DataStore.listFarmers({
      search,
      district,
      taluka,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Farmers GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch farmers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validation = farmerRegistrationSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check duplicate
    const existing = await DataStore.findFarmerByMobile(data.mobile);
    if (existing) {
      return NextResponse.json(
        {
          error: "Farmer already registered with this mobile number.",
          existingFarmer: {
            farmerId: existing.farmerId,
            farmerName: existing.farmerName,
            mobile: existing.mobile,
            village: existing.location.village,
            taluka: existing.location.taluka,
            district: existing.location.district,
          },
        },
        { status: 409 }
      );
    }

    const { farmer, cultivation } = await DataStore.createFarmerWithCultivation({
      farmerName: data.farmerName,
      mobile: data.mobile,
      location: {
        pincode: data.pincode,
        village: data.village,
        taluka: data.taluka,
        district: data.district,
        state: data.state,
      },
      plantingDate: data.plantingDate,
      sugarcaneVariety: data.sugarcaneVariety,
      spacing: data.spacing,
    });

    return NextResponse.json(
      {
        success: true,
        farmer,
        cultivation,
        message: "Farmer data saved successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Farmers POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to register farmer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
