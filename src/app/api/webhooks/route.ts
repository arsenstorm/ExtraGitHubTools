import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const headers = req.headers;

  if (!headers.has("X-Hub-Signature-256")) {
    return NextResponse.json(
      {
        accepted: false,
        error: "No signature provided",
      },
      {
        status: 400,
      },
    );
  }

  const body = await req.json();
  const signature = headers.get("X-Hub-Signature-256") ?? "";
  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!);
  const digest = "sha256=" + hmac.update(JSON.stringify(body)).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return NextResponse.json(
      {
        accepted: false,
        error: "Invalid signature",
      },
      {
        status: 400,
      },
    );
  }

  console.log(body); // maybe we'll need this at some point

  return NextResponse.json(
    {
      accepted: true,
    },
    {
      status: 200,
    },
  );
}
