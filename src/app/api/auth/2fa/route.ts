import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, token } = await req.json();

    if (action === "generate") {
      const secret = speakeasy.generateSecret({ name: "Manhag" });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: secret.base32 },
      });

      return NextResponse.json({ secret: secret.otpauth_url });
    }

    if (action === "verify") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || !user.twoFactorSecret) {
        return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
      });

      if (verified) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { twoFactorEnabled: true },
        });
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
