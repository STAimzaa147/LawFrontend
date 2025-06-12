'use client'
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface ExtendedSession extends Session {
  expires: string;
}

export default function NextAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: ExtendedSession | null;
}): React.ReactNode {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
