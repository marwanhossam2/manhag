"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Since we can't easily fetch server-side and pass it to a client component without
// creating a separate wrapper, we'll fetch the courses on the client side
// Alternatively, we could create a separate `CourseCard` component. For simplicity, we'll fetch them here.

type CourseWithTeacher = {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      // Create a quick API endpoint to fetch courses, or use a server component wrapper
      const res = await fetch("/api/student/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    const res = await fetch("/api/student/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (res.ok) {
      alert("Successfully enrolled!");
      router.push("/student/dashboard");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to enroll");
    }
  };

  if (loading) return <div className="p-8">Loading courses...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Available Courses</h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="border p-4 rounded shadow">
            <h4 className="font-bold text-lg mb-2">{course.title}</h4>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <p className="font-semibold text-lg mb-2">${course.price}</p>
            <div className="mb-4">
              <span className="text-gray-500">Teacher: </span>
              <Link
                href={`/student/teachers/${course.teacher.id}`}
                className="text-blue-500 hover:underline"
              >
                {course.teacher.name || course.teacher.email}
              </Link>
            </div>
            <button
              onClick={() => handleEnroll(course.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Enroll
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
