"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call the API route to handle uploading the course
    const res = await fetch("/api/teacher/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price: parseFloat(price) }),
    });

    if (res.ok) {
      router.push("/teacher/dashboard");
    } else {
      alert("Failed to upload course");
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-bold text-gray-700">Course Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-bold text-gray-700">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-bold text-gray-700">Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Upload Course
        </button>
      </form>
    </div>
  );
}
