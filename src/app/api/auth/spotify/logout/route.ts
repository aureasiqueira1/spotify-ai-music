import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Criar resposta de redirect
    const response = NextResponse.redirect(new URL("/login", request.url));

    // Limpar cookie de sessão
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Remove imediatamente
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);

    // Mesmo em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
