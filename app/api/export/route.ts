import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { generateCsv, ExportRow } from "@/lib/utils/export";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || undefined;
    const variety = searchParams.get("variety") || undefined;
    const district = searchParams.get("district") || undefined;

    const data = await DataStore.getExportData({ season, variety, district });

    const exportRows: ExportRow[] = data.map((c) => ({
      farmerId: c.farmerId,
      farmerName: c.farmerName,
      mobile: c.mobile,
      pincode: c.location?.pincode || "",
      village: c.location?.village || "",
      taluka: c.location?.taluka || "",
      district: c.location?.district || "",
      state: c.location?.state || "Maharashtra",
      plantingDate: c.plantingDate,
      season: c.season,
      sugarcaneVariety: c.sugarcaneVariety,
      spacing: c.spacing,
      createdAt: c.createdAt || new Date(),
    }));

    const csvContent = generateCsv(exportRows);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `CaneTrace_Farmers_Cultivation_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Export API Error]:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
