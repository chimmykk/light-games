"use client";

import MyCreations from "@/components/mycreation";

import { useRouter } from 'next/navigation';

export default function MyCreationsPage() {
  const router = useRouter();

  return (
    <MyCreations setShowCreations={() => router.push("/")} />
  );
}