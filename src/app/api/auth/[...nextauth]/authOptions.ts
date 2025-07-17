import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import type { NextAuthOptions } from "next-auth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const authOptions : NextAuthOptions = {
  providers: [
    //Authentication Provider, use Credentials Provider
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const response = await res.json();

          if (!res.ok || !response.success) {
            throw new Error(response.message || "Login failed");
          }
          console.log("User Login Data",response);
          // Now return user with token from your backend
          return {
            id: response._id,
            name: response.name,
            email: response.email,
            role: response.role,
            token: response.token,
            image: response.photo || "/img/default-avatar.jpg"
          };
        } catch (err) {
          console.error("Login error:", err);
          return null;
        }
      }
    }),
    // ✅ Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),

    // ✅ Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
   pages: {
    signIn: "/auth/signin" // Custom login page
  },
  session: { strategy: "jwt" },
  callbacks: {
  async jwt({ token, user, account }) {
    // 1. Credentials-based login
    if (user && account?.provider === "credentials") {
      token.accessToken = user.token;
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.role = user.role;
      token.picture = user.image;
    }

    // 2. OAuth login (Google, Facebook)
    if (account && (account.provider === "google" || account.provider === "facebook")) {
      try {
        const res = await fetch(`${backendUrl}/api/v1/auth/oauthLogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: token.email,
            name: token.name,
            provider: account.provider,
            image: token.picture,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          token.accessToken = data.token;
          token.id = data._id;
          token.name = data.name;
          token.email = data.email;
          token.role = data.role;
          token.picture = data.photo || "/img/default-avatar.jpg";
        } else {
          console.error("Backend social login failed:", data.message);
        }
      } catch (error) {
        console.error("Social login error:", error);
      }
      // ✅ Store Google access_token (for Calendar API)
      if (account.provider === "google" && account.access_token) {
        token.googleAccessToken = account.access_token;
      }
    }

    return token;
  },

  async session({ session, token }) {
    session.user.id = token.id ?? "";
    session.user.name = token.name ?? "";
    session.user.email = token.email ?? "";
    session.user.role = token.role;
    session.user.image = token.picture;
    session.accessToken = token.accessToken;
    session.googleAccessToken = token.googleAccessToken;
    return session;
  },
},
};
