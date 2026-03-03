import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <div>Please sign in</div>;
  }

  // Fetch reviews for courses taught by this teacher
  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      reviews: {
        include: { student: true },
      },
    },
  });

  const reviews = courses.flatMap((course) => course.reviews);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Course Reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{review.student.name || "Anonymous"}</span>
                <span className="text-yellow-500">
                  {"★".repeat(review.rating)}{" "}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="text-gray-700">{review.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
