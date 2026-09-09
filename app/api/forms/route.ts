import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const forms = await DataStore.listForms();
    return NextResponse.json({ success: true, forms });
  } catch (error) {
    console.error("[Forms GET Error]:", error);
    return NextResponse.json({ error: "Failed to list forms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, slug, description, initialFields } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and Slug are required to create a form." },
        { status: 400 }
      );
    }

    const { form, version } = await DataStore.createForm({
      name,
      slug,
      description,
      initialFields,
    });

    return NextResponse.json({ success: true, form, version }, { status: 201 });
  } catch (error: unknown) {
    console.error("[Forms POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to create form";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
