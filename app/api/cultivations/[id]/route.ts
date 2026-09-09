import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const deleted = await DataStore.deleteCultivation(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `Cultivation ${id} not found or already deleted` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cultivation record ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("[Cultivation DELETE Error]:", error);
    return NextResponse.json(
      { error: "Failed to delete cultivation record" },
      { status: 500 }
    );
  }
}
