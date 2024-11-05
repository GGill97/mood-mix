"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sandy-beige to-terracotta">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="mb-4">An error occurred during authentication: {error}</p>
        <a
          href="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
