"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartPageGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!sessionStorage.getItem("nc-session")) {
      sessionStorage.setItem("nc-session", "1");
      router.replace("/");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
