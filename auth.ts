import NextAuth from "next-auth"
import Github from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo", // repo scope for public + private repos
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) token.accessToken = account.access_token
      return token
    },
    session({ session, token }) {
      if (session.user) session.accessToken = token.accessToken as string
      return session
    },
  },
})