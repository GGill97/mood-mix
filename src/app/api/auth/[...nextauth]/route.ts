// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
// import SpotifyWebApi from "spotify-web-api-node";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    id?: string;
    error?: string;
  }
}

// const spotifyApi = new SpotifyWebApi({
//   clientId: process.env.SPOTIFY_CLIENT_ID!,
//   clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
// });

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token");
    }

    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "user-read-email",
            "playlist-modify-public",
            "playlist-modify-private",
            "user-top-read",
            "user-read-private", // Add this scope
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        console.log("Initial sign in, profile:", profile);
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : 0,
          id: profile.id, // Make sure to get the ID from the profile
        };
      }

      // Return previous token if the access token has not expired
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // Access token expired, refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token, user }) {
      console.log("Session callback:", { token, user });

      // Pass values to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      // Make sure to set the user ID
      if (session.user) {
        session.user.id = token.id as string;
      }

      console.log("Returning session:", session);
      return session;
    },
  },
  debug: true,
  // Add these to help with debugging
  events: {
    async signIn(message) {
      console.log("Sign in event:", message);
    },
    async session(message) {
      console.log("Session event:", message);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
