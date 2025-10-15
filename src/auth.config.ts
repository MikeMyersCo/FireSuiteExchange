import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations/auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/sell');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnApprover = nextUrl.pathname.startsWith('/approver');

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (auth.user.role !== 'ADMIN') return false;
        return true;
      }

      if (isOnApprover) {
        if (!isLoggedIn) return false;
        const userRole = auth.user.role as string;
        if (userRole !== 'APPROVER' && userRole !== 'ADMIN') return false;
        return true;
      }

      if (isOnDashboard) {
        // Let the page handle auth - it will check for verified suites
        // and show appropriate messaging
        return isLoggedIn ? true : false;
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session.user };
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'GUEST' | 'SELLER' | 'APPROVER' | 'ADMIN';
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.isLocked) {
          throw new Error('Account is locked. Please contact support.');
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
