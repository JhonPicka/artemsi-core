import { redirect } from "next/navigation";

/** Ancienne route — redirige vers l'inscription unique. */
export default function SignupGratuitRedirectPage() {
  redirect("/signup");
}
