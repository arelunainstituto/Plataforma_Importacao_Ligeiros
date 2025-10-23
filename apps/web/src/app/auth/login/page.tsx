import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plataforma de Importação</h1>
          <p className="text-gray-600 mt-2">Gestão de processos de importação de veículos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          © {new Date().getFullYear()} TRAe Projects. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}



