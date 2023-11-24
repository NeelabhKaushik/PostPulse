import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";

import React from "react";

const PopularGroups = async () => {
  const popularGroups = await db.subgroup.findMany({
    orderBy: {
      subscribers: {
        _count: "desc",
      },
    },
    take: 5,
    include: {
      subscribers: true,
    },
  });

  return (
    <div className="p-2 overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
      <div className="px-6 py-4">
        <div className="flex">
          <p className="font-semibold py-3">Popular Groups</p>
        </div>
      </div>
      <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className=" text-gray-900">Group name</dt>
          <dd className="text-gray-900">Members</dd>
        </div>
        {popularGroups?.map((subgroup) => {
          return (
            <div className="flex items-center justify-between  gap-x-4 py-3 ">
              <Link href={`/g/${subgroup.name}`}>
                <dt className="text-gray-500">
                  <span style={{ fontWeight: "bold" }}>g/</span>
                  <span className="underline">{subgroup.name}</span>
                </dt>
              </Link>
              <dd className="text-gray-700">{subgroup.subscribers.length}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
};

export default PopularGroups;
