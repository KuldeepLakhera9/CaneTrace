import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const form = await DataStore.findFormBySlug(slug);

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Farmers must only access PUBLISHED forms
    if (form.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This form is currently closed or not yet published." },
        { status: 403 }
      );
    }

    const version = form.currentVersionId
      ? await DataStore.getFormVersion(form.currentVersionId)
      : await DataStore.getLatestVersionForForm(form.formId);

    if (!version) {
      return NextResponse.json(
        { error: "Form version not found." },
        { status: 500 }
      );
    }

    // Return only public fields and safe metadata
    return NextResponse.json({
      success: true,
      form: {
        formId: form.formId,
        name: form.name,
        slug: form.slug,
        description: form.description,
        version: version.version,
        fields: version.fields,
      },
    });
  } catch (error) {
    console.error("[Public Form GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve public form" },
      { status: 500 }
    );
  }
}
