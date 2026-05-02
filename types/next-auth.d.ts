import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "STUDENT";
      studentId?: string | null;
      phone?: string | null;
    };
  }

  interface User {
    role: "ADMIN" | "STUDENT";
    studentId?: string | null;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "STUDENT";
    studentId?: string | null;
    phone?: string | null;
  }
}
