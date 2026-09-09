import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";
import { requireAdminSession } from "@/lib/services/apiAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const form = await DataStore.findFormById(id);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const version = form.currentVersionId
      ? await DataStore.getFormVersion(form.currentVersionId)
      : await DataStore.getLatestVersionForForm(form.formId);

    return NextResponse.json({ success: true, form, version });
  } catch (error) {
    console.error("[Form Details GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch form details" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, name, description, fields } = body;

    if (action === "publish") {
      const form = await DataStore.publishForm(id);
      return NextResponse.json({ success: true, form, message: "Form published successfully" });
    }

    if (action === "archive") {
      const form = await DataStore.archiveForm(id);
      return NextResponse.json({ success: true, form, message: "Form archived successfully" });
    }

    if (action === "publish-new-version") {
      if (!fields || !Array.isArray(fields)) {
        return NextResponse.json({ error: "Fields array is required" }, { status: 400 });
      }
      const result = await DataStore.publishNewVersion(id, fields);
      return NextResponse.json({
        success: true,
        form: result.form,
        version: result.version,
        message: `Version ${result.version.version} published successfully!`,
      });
    }

    // Default: Save draft
    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Fields array is required" }, { status: 400 });
    }

    const result = await DataStore.updateFormDraft(id, {
      name,
      description,
      fields,
    });

    return NextResponse.json({
      success: true,
      form: result.form,
      version: result.version,
      message: "Draft saved successfully",
    });
  } catch (error: unknown) {
    console.error("[Form Update Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update form";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
