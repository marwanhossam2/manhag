import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await prisma.user.findUnique({
    where: { id: id },
    include: {
      coursesGiven: {
        include: {
          reviews: {
            include: { student: true },
          },
        },
      },
    },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    return notFound();
  }

  // Flatten all reviews for the teacher's courses
  const reviews = teacher.coursesGiven.flatMap((course) => course.reviews);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{teacher.name || "Teacher Profile"}</h1>
      <p className="text-xl mb-8">{teacher.email}</p>

      <h2 className="text-2xl font-semibold mb-4">Courses</h2>
      <ul className="mb-8 space-y-4">
        {teacher.coursesGiven.map((course) => (
          <li key={course.id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p className="text-gray-600">{course.description}</p>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border p-4 rounded shadow">
              <p className="font-bold">{review.student.name || "Anonymous Student"}</p>
              <div className="flex items-center text-yellow-500 mb-2">
                {"★".repeat(review.rating)}{" "}
                {"☆".repeat(5 - review.rating)}
              </div>
              <p className="text-gray-700">{review.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
