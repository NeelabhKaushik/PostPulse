import { db } from "@/lib/db";
import { Compass, Users } from "lucide-react";
import Link from "next/link";

const ExploreGroups = async () => {
  const groups = await db.subgroup.findMany({
    orderBy: {
      subscribers: {
        _count: "desc",
      },
    },
    include: {
      subscribers: true,
    },
    take: 8,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Explore all groups</h2>
          </div>
          <span className="text-sm text-gray-500">{groups.length}+ groups</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Thats all for your feed. Browse communities and jump into the ones
          that match your interests.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {groups.map((subgroup) => (
          <Link
            key={subgroup.id}
            href={`/g/${subgroup.name}`}
            className="rounded-lg border border-gray-200 p-4 transition hover:border-purple-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">g/{subgroup.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Discover posts, discussions, and updates.
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                <Users className="h-3.5 w-3.5" />
                {subgroup.subscribers.length}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExploreGroups;
