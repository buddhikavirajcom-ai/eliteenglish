import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { UserRole } from "@prisma/client";
import { type NextAuthOptions, getServerSession, type User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

async function syncSessionToken(token: JWT): Promise<JWT> {
  if (!token.sub) {
    return token;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: token.sub },
    include: { student: true }
  });

  if (!dbUser) {
    return token;
  }

  token.role = dbUser.role;
  token.studentId = dbUser.student?.id ?? null;
  token.phone = dbUser.phone ?? null;
  token.name = dbUser.name;
  token.email = dbUser.email ?? token.email ?? null;

  return token;
}

const providers: Provider[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      identifier: { label: "Email or phone", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const identifier = parsed.data.identifier.trim();
      const normalizedEmail = identifier.toLowerCase();

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { phone: identifier }]
        },
        include: {
          student: true
        }
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student?.id ?? null,
        phone: user.phone
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.toLowerCase() ?? profile?.email?.toLowerCase();

      if (!email) {
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
      });

      if (existingUser) {
        user.id = existingUser.id;
        user.role = existingUser.role;
        user.studentId = existingUser.student?.id ?? null;
        user.phone = existingUser.phone ?? null;

        if (existingUser.name !== (user.name ?? existingUser.name)) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name ?? existingUser.name
            }
          });
        }

        return true;
      }

      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      const createdUser = await prisma.user.create({
        data: {
          name: user.name?.trim() || "Google user",
          email,
          passwordHash,
          role: UserRole.STUDENT
        }
      });

      const mutableUser = user as NextAuthUser;
      mutableUser.id = createdUser.id;
      mutableUser.role = createdUser.role;
      mutableUser.studentId = null;
      mutableUser.phone = createdUser.phone ?? null;

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.studentId = user.studentId ?? null;
        token.phone = user.phone ?? null;
      }

      if (trigger === "update" || !token.role || token.studentId === undefined) {
        return await syncSessionToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      const syncedToken = await syncSessionToken(token);

      if (session.user) {
        session.user.id = syncedToken.sub ?? "";
        session.user.role = syncedToken.role ?? UserRole.STUDENT;
        session.user.studentId = syncedToken.studentId ?? null;
        session.user.phone = syncedToken.phone ?? null;
        session.user.name = syncedToken.name ?? session.user.name;
        session.user.email = syncedToken.email ?? session.user.email;
      }

      return session;
    }
  }
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireStudent() {
  const user = await requireAuth();

  if (user.role !== UserRole.STUDENT || !user.studentId) {
    redirect("/dashboard");
  }

  return user;
}
