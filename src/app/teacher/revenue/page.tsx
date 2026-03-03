import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RevenuePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <div>Please sign in</div>;
  }

  // Fetch monthly revenue for the teacher
  const revenueData = await prisma.revenue.findMany({
    where: { teacherId: session.user.id },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Monthly Revenue</h1>

      {revenueData.length === 0 ? (
        <p>No revenue data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="w-full bg-gray-100 border-b">
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Month / Year</th>
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data) => (
                <tr key={data.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    {data.month} / {data.year}
                  </td>
                  <td className="py-2 px-4 font-bold text-green-600">
                    ${data.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
