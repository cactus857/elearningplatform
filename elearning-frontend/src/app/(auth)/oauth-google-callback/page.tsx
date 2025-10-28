"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { setTokens } from "@/utils/token.service";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const OauthCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchUserAfterLogin } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    const handleAuth = async () => {
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        await fetchUserAfterLogin();
        router.push("/");
      } else {
        const errorMessage = searchParams.get("errorMessage");
        router.push(
          `/sign-in?error=${errorMessage || "Authentication failed"}`
        );
      }
    };

    handleAuth();
  }, [searchParams, router, fetchUserAfterLogin]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner />
      <p className="ml-4">Authenticating with Google, please wait...</p>
    </div>
  );
};

export default OauthCallbackPage;
