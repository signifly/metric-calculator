import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "signifly.com"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith("@signifly.com") || false
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session }) {
      return session
    }
  },
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60 // 8 hours
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
