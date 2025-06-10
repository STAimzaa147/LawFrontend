import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
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
          const res = await fetch("http://localhost:5050/api/v1/auth/login", {
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

          // Now return user with token from your backend
          return {
            id: response._id,
            name: response.name,
            email: response.email,
            role: response.role,
            token: response.token,
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
  async jwt({ token, user }) {
    if (user) {
      // On initial sign in, copy user info and token into JWT
      token.accessToken = user.token; // your backend token
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    // Expose token fields in session.user
    session.user.id = token.id;
    session.user.name = token.name;
    session.user.email = token.email;
    session.user.role = token.role;
    session.accessToken = token.accessToken; // make token available on client session
    return session;
  },
},

};
