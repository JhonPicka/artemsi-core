import { redirect } from "next/navigation";

import { getFreshLoginPath } from "@/lib/auth-paths";

export default function SignupPage() {
  redirect(getFreshLoginPath());
}
