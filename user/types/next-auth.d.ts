import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    isNewUser?: boolean
    user: {
      id?: string
      address?: string
      phone_number?: string
      pin_code?: string
      area?: string
      district?: string
      state?: string
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    address?: string
    phone_number?: string
    pin_code?: string
    area?: string
    district?: string
    state?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    userId?: string
    address?: string
    phone_number?: string
    pin_code?: string
    area?: string
    district?: string
    state?: string
    isNewUser?: boolean
  }
}
