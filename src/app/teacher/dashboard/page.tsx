import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <div>Please sign in</div>;
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <h2 className="text-xl font-semibold mb-2">Welcome, {session.user.name}</h2>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Your Courses</h3>
        {courses.length === 0 ? (
          <p>You have not uploaded any courses yet.</p>
        ) : (
          <ul className="space-y-4">
            {courses.map((course) => (
              <li key={course.id} className="border p-4 rounded shadow">
                <h4 className="font-bold text-lg">{course.title}</h4>
                <p className="text-gray-600">{course.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TwoFactorSetup />
    </div>
  );
}
