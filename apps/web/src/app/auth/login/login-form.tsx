"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Modo DEMO: simular login
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      
      if (isDemoMode) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Validar credenciais de DEMO
        if (email === "admin@example.com" && password === "password123") {
          toast.success("Login efetuado com sucesso! (Modo DEMO)");
          router.push("/dashboard");
          return;
        } else {
          toast.error("Credenciais inválidas", {
            description: "Use: admin@example.com / password123",
          });
          return;
        }
      }

      // Modo produção: usar Supabase
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message,
        });
        return;
      }

      toast.success("Login efetuado com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "A entrar..." : "Entrar"}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <p>Demo: admin@example.com / password123</p>
      </div>
    </form>
  );
}

