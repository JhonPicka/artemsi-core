import { redirect } from "next/navigation";

import { AdminSetupForm } from "@/components/admin/admin-setup-form";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminNeedsNameSetup } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSetupPage() {
  const user = await requireAdminUser();

  if (!(await adminNeedsNameSetup(user))) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="centered-page">
      <AdminSetupForm
        initialName={profile?.full_name?.trim() ?? ""}
        email={user.email ?? ""}
      />
    </main>
  );
}
