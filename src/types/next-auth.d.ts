import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      signInCount: number;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    signInCount: number;
    twoFactorEnabled: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    signInCount: number;
    twoFactorEnabled: boolean;
  }
}
