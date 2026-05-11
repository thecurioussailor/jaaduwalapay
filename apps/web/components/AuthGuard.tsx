"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "../lib/auth";

const ONBOARDING_PATHS = [
  "/onboarding/profile",
  "/onboarding/wallet",
  "/onboarding/complete",
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/signin");
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_URL + "/merchant/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ merchant }) => {
        if (!merchant) {
          router.replace("/signin");
          return;
        }

        const onOnboardingPath = ONBOARDING_PATHS.some((p) =>
          pathname.startsWith(p)
        );

        if (!merchant.isOnboarded && !onOnboardingPath) {
          router.replace("/onboarding/profile");
          return;
        }

        if (merchant.isOnboarded && onOnboardingPath) {
          router.replace("/dashboard");
          return;
        }

        setChecked(true);
      })
      .catch(() => {
        router.replace("/signin");
      });
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
