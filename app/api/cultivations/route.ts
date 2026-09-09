import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { addCultivationSchema } from "@/lib/validations/farmer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const season = searchParams.get("season") || "";
    const variety = searchParams.get("variety") || "";
    const spacing = searchParams.get("spacing") || "";
    const district = searchParams.get("district") || "";
    const taluka = searchParams.get("taluka") || "";
    const village = searchParams.get("village") || "";
    const year = searchParams.get("year") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await DataStore.listCultivations({
      search,
      season,
      variety,
      spacing,
      district,
      taluka,
      village,
      year,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Cultivations GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch cultivations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = addCultivationSchema.safeParse(body);
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
    const cultivation = await DataStore.addCultivation({
      farmerId: data.farmerId,
      plantingDate: data.plantingDate,
      sugarcaneVariety: data.sugarcaneVariety,
      spacing: data.spacing,
    });

    return NextResponse.json(
      {
        success: true,
        cultivation,
        message: "Cultivation record added successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Cultivations POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to add cultivation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
