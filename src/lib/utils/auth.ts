import connectToDatabase from "@/lib/infrastructure/database/connection";
import { User as UserModel } from "@/lib/infrastructure/models";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export interface SessionUser {
  id: string;
  spotifyId: string;
  email: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
}

export async function getUserFromSession(
  request: NextRequest
): Promise<SessionUser | null> {
  try {
    const sessionCookie = request.cookies.get("session");

    if (!sessionCookie) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(sessionCookie.value, secret);

    if (!payload.userId) {
      return null;
    }

    // Buscar usuário no banco para obter tokens atualizados
    await connectToDatabase();
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      spotifyId: user.spotifyId,
      email: user.email,
      displayName: user.displayName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenExpiresAt: user.tokenExpiresAt,
    };
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<SessionUser> {
  const user = await getUserFromSession(request);

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  return user;
}
