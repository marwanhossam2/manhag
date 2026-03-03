"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

type EnrollmentWithCourse = {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
};

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const router = useRouter();

  const [reviewingCourseId, setReviewingCourseId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const res = await fetch("/api/student/dashboard-data");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments);
        setSessionName(data.name);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingCourseId) return;

    const res = await fetch("/api/student/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: reviewingCourseId, rating, content }),
    });

    if (res.ok) {
      alert("Review submitted successfully!");
      setReviewingCourseId(null);
      setRating(5);
      setContent("");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to submit review");
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <h2 className="text-xl font-semibold mb-2">Welcome, {sessionName || "Student"}</h2>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Your Enrolled Courses</h3>
        {enrollments.length === 0 ? (
          <p>You are not enrolled in any courses yet.</p>
        ) : (
          <ul className="space-y-4">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id} className="border p-4 rounded shadow">
                <h4 className="font-bold text-lg">{enrollment.course.title}</h4>
                <p className="text-gray-600 mb-4">{enrollment.course.description}</p>

                {reviewingCourseId === enrollment.course.id ? (
                  <form onSubmit={handleReviewSubmit} className="mt-4 p-4 border rounded bg-gray-50">
                    <h5 className="font-semibold mb-2">Write a Review</h5>
                    <div className="mb-2">
                      <label className="block text-sm">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1" max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-20"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm">Review</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
                      <button type="button" onClick={() => setReviewingCourseId(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setReviewingCourseId(enrollment.course.id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Leave Review
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <TwoFactorSetup />
    </div>
  );
}
