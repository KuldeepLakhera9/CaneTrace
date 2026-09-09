import { notFound } from "next/navigation";
import { DataStore } from "@/lib/db/store";
import { FormBuilderView } from "@/components/forms/FormBuilderView";

export const dynamic = "force-dynamic";

export default async function AdminFormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await DataStore.findFormById(id);

  if (!form) {
    notFound();
  }

  const version = form.currentVersionId
    ? await DataStore.getFormVersion(form.currentVersionId)
    : await DataStore.getLatestVersionForForm(form.formId);

  if (!version) {
    notFound();
  }

  const serializedForm = JSON.parse(JSON.stringify(form));
  const serializedVersion = JSON.parse(JSON.stringify(version));

  return (
    <div className="space-y-6">
      <FormBuilderView
        initialForm={serializedForm}
        initialVersion={serializedVersion}
      />
    </div>
  );
}
