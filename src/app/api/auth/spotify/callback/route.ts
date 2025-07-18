import connectToDatabase from "@/lib/infrastructure/database/connection";
import { SpotifyAPI } from "@/lib/infrastructure/external/SpotifyAPI";
import { User as UserModel } from "@/lib/infrastructure/models";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=missing_code", request.url)
      );
    }

    // Trocar código por tokens
    const tokenResponse = await SpotifyAPI.exchangeCodeForToken(code);

    // Obter dados do usuário
    const spotifyAPI = new SpotifyAPI(tokenResponse.access_token);
    const spotifyUser = await spotifyAPI.getCurrentUser();

    // Criar ou atualizar usuário no banco
    await connectToDatabase();

    const user = await UserModel.findOneAndUpdate(
      { spotifyId: spotifyUser.id },
      {
        $set: {
          spotifyId: spotifyUser.id,
          displayName: spotifyUser.display_name,
          email: spotifyUser.email,
          profileImage: spotifyUser.images?.[0]?.url,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Criar JWT token para sessão
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "your-secret-key"
    );

    const token = await new SignJWT({
      userId: user._id.toString(),
      spotifyId: user.spotifyId,
      email: user.email,
      displayName: user.displayName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Configurar cookie de sessão
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no callback do Spotify:", error);

    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
