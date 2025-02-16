import type { User } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import type { Provider } from "next-auth/providers";
import type { Adapter } from "next-auth/adapters";

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      isAdmin: boolean;
    }
  }
}

declare module 'next-auth/core' {
  interface AuthOptions {
    providers: Provider[];
    adapter?: Adapter;
    secret?: string;
    session?: {
      strategy: "jwt";
      maxAge?: number;
    };
    pages?: {
      signIn?: string;
      error?: string;
    };
    callbacks?: {
      session?(params: { session: Session; token: JWT }): Promise<Session>;
      jwt?(params: { token: JWT; user: User | null }): Promise<JWT>;
    };
  }
}