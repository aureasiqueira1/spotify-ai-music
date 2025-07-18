"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSpotifyToken() {
  const { data: session, status, update } = useSession();
  const [tokenStatus, setTokenStatus] = useState<
    "checking" | "valid" | "invalid" | "expired"
  >("checking");

  useEffect(() => {
    if (status === "loading") {
      setTokenStatus("checking");
      return;
    }

    if (status === "unauthenticated") {
      setTokenStatus("invalid");
      return;
    }

    if (session?.error === "RefreshAccessTokenError") {
      setTokenStatus("expired");
      return;
    }

    if (session?.accessToken) {
      // Verificar se o token funciona fazendo uma chamada simples
      verifyToken(session.accessToken);
    } else {
      setTokenStatus("invalid");
    }
  }, [session, status]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTokenStatus("valid");
      } else if (response.status === 401) {
        setTokenStatus("expired");
        // Tentar renovar automaticamente
        await update();
      } else {
        setTokenStatus("invalid");
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      setTokenStatus("invalid");
    }
  };

  const refreshToken = async () => {
    try {
      setTokenStatus("checking");
      await update();

      // Aguardar um pouco para a renovação
      setTimeout(() => {
        if (session?.accessToken) {
          verifyToken(session.accessToken);
        }
      }, 1000);
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      setTokenStatus("invalid");
    }
  };

  return {
    tokenStatus,
    session,
    refreshToken,
    isValid: tokenStatus === "valid",
    isChecking: tokenStatus === "checking",
    isExpired: tokenStatus === "expired",
    isInvalid: tokenStatus === "invalid",
  };
}
