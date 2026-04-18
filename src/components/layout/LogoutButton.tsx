"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-muted-foreground hover:text-red-500 text-xs">
      Salir
    </Button>
  );
}