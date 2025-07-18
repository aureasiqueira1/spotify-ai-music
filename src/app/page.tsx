import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirecionar para login
  redirect("/login");

  // Esta parte nunca será executada devido ao redirect
  return null;
}
