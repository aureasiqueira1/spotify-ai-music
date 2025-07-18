// middleware.ts (na raiz do projeto)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Se há erro de token, redirecionar para página de erro específica
    if (req.nextauth.token?.error === "RefreshAccessTokenError") {
      const url = new URL("/auth/error", req.url);
      url.searchParams.set("error", "TokenExpired");
      return NextResponse.redirect(url);
    }

    // Se não há token válido para rotas protegidas
    if (pathname.startsWith("/dashboard") && !req.nextauth.token?.accessToken) {
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Sempre permitir rotas de autenticação
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/")) {
          return true;
        }

        // Para rotas protegidas, verificar token
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/api/playlists")
        ) {
          return !!token && token.error !== "RefreshAccessTokenError";
        }

        // Permitir outras rotas
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/playlists/:path*"],
};
