"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PinchRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/tools/brain-fuel"); }, [router]);
  return null;
}
