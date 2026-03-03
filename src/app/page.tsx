import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Welcome to <span className="text-blue-600">Manhag</span>
        </h1>
        <p className="text-xl text-gray-600">
          The ultimate platform for learning and teaching. Choose your courses,
          connect with expert teachers, and grow your skills today.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          {!session ? (
            <>
              <Link
                href="/api/auth/signin"
                className="px-8 py-3 w-full sm:w-auto text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-3 w-full sm:w-auto text-lg font-semibold text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 shadow"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700 w-full sm:w-auto text-center sm:text-left">
                Logged in as {session.user.name || session.user.email}
              </p>
              {session.user.role === "STUDENT" ? (
                <Link
                  href="/student/dashboard"
                  className="px-8 py-3 w-full sm:w-auto text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow"
                >
                  Go to Student Dashboard
                </Link>
              ) : (
                <Link
                  href="/teacher/dashboard"
                  className="px-8 py-3 w-full sm:w-auto text-lg font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow"
                >
                  Go to Teacher Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
