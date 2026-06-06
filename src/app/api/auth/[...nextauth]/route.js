import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    // 1. When a user signs in, ensure they exist in your database
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // Automatically promote work.abhisheky@gmail.com to ADMIN role
      const adminEmails = ["work.abhisheky@gmail.com"];
      const role = adminEmails.includes(user.email) ? "ADMIN" : "CUSTOMER";

      if (!existingUser) {
        const nameParts = (user.name || "New User").split(" ");
        await prisma.user.create({
          data: {
            email: user.email,
            role: role,
            firstName: nameParts[0] || "New",
            lastName: nameParts.slice(1).join(" ") || "User",
          },
        });
      } else if (existingUser.role !== role && adminEmails.includes(user.email)) {
        // Update to ADMIN if they logged in before but weren't ADMIN
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" },
        });
      }
      return true;
    },

    // 2. Fetch the user's role from your database and attach it to the session
    async session({ session }) {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role; // "ADMIN" or "CUSTOMER"
          session.user.firstName = dbUser.firstName;
          session.user.lastName = dbUser.lastName;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
