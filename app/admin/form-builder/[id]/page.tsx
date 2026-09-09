import { redirect } from "next/navigation";

export default async function AdminFormBuilderRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/form-builder/${id}`);
}
