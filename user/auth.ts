import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Attempting login with:', credentials?.email);
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/login/`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          })
          
          console.log('Backend response status:', res.status);
          
          const data = await res.json()
          console.log('Backend response data:', data);
          
          if (!res.ok) {
            console.error('Login failed:', data.error?.message);
            throw new Error(data.error?.message || "Login failed")
          }
          
          if (data.token && data.user) {
            console.log('Login successful for user:', data.user.email);
            return {
              id: String(data.user.id),
              name: data.user.name,
              email: data.user.email,
              accessToken: data.token,
              address: data.user.address,
              phone_number: data.user.phone_number,
              pin_code: data.user.pin_code,
              area: data.user.area,
              district: data.user.district,
              state: data.user.state,
            }
          }
          
          console.error('Invalid response format from backend');
          return null
        } catch (error) {
          console.error('Authorization error:', error);
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.userId = user.id
        token.address = user.address
        token.phone_number = user.phone_number
        token.pin_code = user.pin_code
        token.area = user.area
        token.district = user.district
        token.state = user.state
      }
      
      // Google Sign In
      if (account && account.provider === "google") {
        console.log('[Auth] Google sign-in detected, exchanging token...');
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/google/`, {
            method: 'POST',
            body: JSON.stringify({ access_token: account.access_token }),
            headers: { "Content-Type": "application/json" }
          })
          
          const data = await res.json()
          console.log('[Auth] Backend response:', data);
          
          if (res.ok && data.token) {
            token.accessToken = data.token
            token.userId = data.user.id
            token.address = data.user.address
            token.phone_number = data.user.phone_number
            token.pin_code = data.user.pin_code
            token.area = data.user.area
            token.district = data.user.district
            token.state = data.user.state
            token.isNewUser = data.is_new_user || false
            console.log('[Auth] Set isNewUser flag:', token.isNewUser);
          }
        } catch (error) {
          console.error("Google auth exchange failed", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('[Auth] Building session, token.isNewUser:', token.isNewUser);
      
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      if (token.userId) {
        session.user.id = token.userId
      }
      if (token.address) {
        session.user.address = token.address
      }
      if (token.phone_number) {
        session.user.phone_number = token.phone_number
      }
      if (token.pin_code) {
        session.user.pin_code = token.pin_code
      }
      if (token.area) {
        session.user.area = token.area
      }
      if (token.district) {
        session.user.district = token.district
      }
      if (token.state) {
        session.user.state = token.state
      }
      
      // Only pass isNewUser flag on the FIRST session after Google login
      // After that, it should be cleared
      if (token.isNewUser === true) {
        session.isNewUser = true
        console.log('[Auth] Set session.isNewUser:', session.isNewUser);
        // Clear the flag in the token so it won't appear in next session
        token.isNewUser = false;
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

