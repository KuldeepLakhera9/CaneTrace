import { notFound } from "next/navigation";
import { DataStore } from "@/lib/db/store";
import { PublicDynamicForm } from "@/components/forms/PublicDynamicForm";

export const dynamic = "force-dynamic";

export default async function DynamicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await DataStore.findFormBySlug(slug);

  if (!form || form.status !== "PUBLISHED") {
    notFound();
  }

  const version = form.currentVersionId
    ? await DataStore.getFormVersion(form.currentVersionId)
    : await DataStore.getLatestVersionForForm(form.formId);

  if (!version) {
    notFound();
  }

  // Safe serialization for Client Components
  const serializedForm = JSON.parse(JSON.stringify(form));
  const serializedFields = JSON.parse(JSON.stringify(version.fields));

  return <PublicDynamicForm form={serializedForm} fields={serializedFields} />;
}
