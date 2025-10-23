import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Modo DEMO: permitir acesso sem autenticação
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  if (isDemoMode) {
    return NextResponse.next();
  }

  // Modo produção: usar Supabase auth
  try {
    const { updateSession } = await import("@/lib/supabase/middleware");
    return await updateSession(request);
  } catch (error) {
    // Se Supabase não estiver configurado, permitir acesso em dev
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }
    throw error;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
