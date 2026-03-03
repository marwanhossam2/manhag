import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// This is a protected API route (you might want to secure it with a secret token for CRON jobs or admin-only access)
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.API_SECRET_TOKEN || "development-secret";

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message, roleTarget } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch users based on role targeting, or all users if none provided
    const users = await prisma.user.findMany({
      where: roleTarget ? { role: roleTarget } : undefined,
      select: { id: true, email: true },
    });

    const emailPromises = users
      .filter((user) => user.email)
      .map((user) => {
        // Automatically send email via Nodemailer
        sendEmail(user.email as string, subject, message);

        // Save notification to database
        return prisma.notification.create({
          data: {
            userId: user.id,
            title: subject,
            message: message,
          },
        });
      });

    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
