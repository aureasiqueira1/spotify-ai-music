import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Teste 1: Verificar se o token funciona
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Token inválido", status: userResponse.status },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();

    // Teste 2: Fazer uma busca simples (em vez de recommendations)
    const searchParams = new URLSearchParams({
      q: "happy music",
      type: "track",
      limit: "5",
      market: "BR",
    });

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      return NextResponse.json(
        {
          error: "Erro na busca",
          status: searchResponse.status,
          details: errorData,
        },
        { status: 500 }
      );
    }

    const searchData = await searchResponse.json();

    return NextResponse.json({
      user: userData,
      search: searchData,
      message: "Testes bem-sucedidos!",
    });
  } catch (error: any) {
    console.error("Erro no teste:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error.message || "Erro desconhecido",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
