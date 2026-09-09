import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid form submission data" },
        { status: 400 }
      );
    }

    const result = await DataStore.submitPublicForm({
      slug,
      data: body,
    });

    return NextResponse.json(
      {
        success: true,
        referenceNumber: result.referenceNumber,
        formName: result.formName,
        message: "Thank you. Your information has been successfully submitted.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Public Form Submit Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process form submission";

    // Privacy-safe duplicate conflict check
    if (message.includes("already registered")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
