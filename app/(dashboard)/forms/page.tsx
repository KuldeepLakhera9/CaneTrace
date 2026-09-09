import { DataStore } from "@/lib/db/store";
import { FormsListView } from "@/components/forms/FormsListView";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const forms = await DataStore.listForms();
  const serialized = JSON.parse(JSON.stringify(forms));

  return <FormsListView initialForms={serialized} />;
}
