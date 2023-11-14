import MiniCreatePost from "@/components/MiniCreatePost";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    slug: string;
  };
}
const page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session = await getAuthSession();

  const subgroup = await db.subgroup.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subgroup: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subgroup) return notFound();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">g/{subgroup.name}</h1>
      <MiniCreatePost session={session} />
      {/* <PostFeed initialPosts={subgroup.posts} subgroupName={subgroup.name} /> */}
    </>
  );
};

export default page;
