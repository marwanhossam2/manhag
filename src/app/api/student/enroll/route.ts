import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId,
      },
    });

    // Optionally: Update teacher revenue
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course && course.price > 0) {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      await prisma.revenue.upsert({
        where: {
          teacherId_month_year: {
            teacherId: course.teacherId,
            month,
            year,
          },
        },
        update: {
          amount: {
            increment: course.price,
          },
        },
        create: {
          teacherId: course.teacherId,
          month,
          year,
          amount: course.price,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
