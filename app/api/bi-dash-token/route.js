import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = jwt.sign(
    {
      sub: "user-id-123", // your internal user ID
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes expiry
    },
    process.env.MONGODB_CHARTS_EMBED_SECRET,  
    { algorithm: "HS256" }
  );

  return NextResponse.json({ token });
}