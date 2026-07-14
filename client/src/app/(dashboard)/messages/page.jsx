"use client";

import { Suspense } from "react";
import MessagesLayout from "@/features/messages/components/MessagesLayout";

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesLayout />
    </Suspense>
  );
}
