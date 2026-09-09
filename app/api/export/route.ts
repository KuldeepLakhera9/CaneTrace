import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { generateExcelBuffer, generateCsv, ExportRow } from "@/lib/utils/export";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {

    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || undefined;
    const variety = searchParams.get("variety") || undefined;
    const district = searchParams.get("district") || undefined;
    const formatType = searchParams.get("format") || "xlsx";

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

    const timestamp = new Date().toISOString().slice(0, 10);

    if (formatType === "csv") {
      const csvContent = generateCsv(exportRows);
      const filename = `CaneTrace_Farmers_${timestamp}.csv`;
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: Genuine Microsoft Excel (.xlsx) file
    const excelBuffer = generateExcelBuffer(exportRows);
    const filename = `CaneTrace_Farmers_Cultivation_${timestamp}.xlsx`;

    return new NextResponse(excelBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Export API Error]:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
