import { DefaultSession } from "next-auth";

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
    image: string;
    id: string;
    name: string;
    email: string;
    role?: string;
    token?: string;  // add your token here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    picture: string;
    accessToken?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  }
}
