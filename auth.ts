import NextAuth from "next-auth"
import Github from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo", 
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) token.accessToken = account.access_token
      if (profile && typeof (profile as { login?: string }).login === "string") {
        token.login = (profile as { login: string }).login
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string
        session.user.login = token.login as string | null | undefined
      }
      return session
    },
  },
})