"use client";

import { signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass p-8 rounded-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Sign in to Mood Mix</h1>
        <button
          onClick={() => signIn("spotify", { callbackUrl: "/" })}
          className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <FaSpotify className="text-xl" />
          Continue with Spotify
        </button>
      </div>
    </div>
  );
}
