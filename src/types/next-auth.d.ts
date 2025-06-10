import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    token?: string;  // add your token here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  }
}
