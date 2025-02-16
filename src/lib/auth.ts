import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "@auth/core/adapters";

type UserId = string | number;

type UserWithAdmin = {
  id: UserId;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
};

declare module "next-auth" {
  interface Session {
    user: UserWithAdmin;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
  }
}

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    })
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User | AdapterUser | null }) {
      if (user) {
        const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
        token.sub = String(userId);
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { isAdmin: true }
        });
        token.isAdmin = dbUser?.isAdmin || false;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

export type AuthSession = Session & {
  user: UserWithAdmin;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return session as AuthSession;
} 