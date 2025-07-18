import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Scopes necessários do Spotify
const scopes = [
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log(
        "JWT Callback - Token:",
        !!token.accessToken,
        "Account:",
        !!account
      );

      // Salvar token de acesso e refresh token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600000; // 1 hora se não especificado
        token.user = user;
        console.log(
          "Novo token salvo, expira em:",
          new Date(token.accessTokenExpires as number)
        );
        return token;
      }

      // Verificar se o token ainda é válido (com margem de segurança de 5 minutos)
      const timeUntilExpiry = (token.accessTokenExpires as number) - Date.now();
      if (timeUntilExpiry > 300000) {
        // 5 minutos
        console.log(
          "Token ainda válido por:",
          Math.round(timeUntilExpiry / 60000),
          "minutos"
        );
        return token;
      }

      // Token expirado ou próximo do vencimento, tentar renovar
      console.log("Token expirado ou próximo do vencimento, renovando...");
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      console.log(
        "Session Callback - Token:",
        !!token.accessToken,
        "Error:",
        token.error
      );

      // Não retornar sessão se houver erro de refresh
      if (token.error === "RefreshAccessTokenError") {
        console.log("Erro de refresh token, sessão inválida");
        return { ...session, error: "RefreshAccessTokenError" };
      }

      // Enviar propriedades para o cliente
      session.accessToken = token.accessToken as string;
      session.user = token.user as any;
      session.error = token.error as string;

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

async function refreshAccessToken(token: any) {
  console.log("Tentando renovar token...");

  try {
    const url = "https://accounts.spotify.com/api/token";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();
    console.log("Resposta do refresh:", response.status, refreshedTokens);

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Erro ao renovar token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
