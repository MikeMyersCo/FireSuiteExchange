import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'GUEST' | 'SELLER' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'GUEST' | 'SELLER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'GUEST' | 'SELLER' | 'ADMIN';
  }
}
