import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.json({ error: "No code provided" }, { status: 400 });
}
