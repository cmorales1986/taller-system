/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.nombre = (user as any).nombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).rol = token.rol;
        (session.user as any).nombre = token.nombre;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuarios.findUnique({
          where: { email: credentials.email as string }
        });

        if (!usuario || !usuario.activo) return null;

        const passwordValido = await bcrypt.compare(
          credentials.password as string,
          usuario.password_hash
        );

        if (!passwordValido) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          nombre: usuario.nombre,
          rol: usuario.rol,
        };
      }
    })
  ]
});