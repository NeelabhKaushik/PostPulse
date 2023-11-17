import ProfilePostFeed from "@/components/ProfilePostFeed";
import ToFeedButton from "@/components/ToFeedButton";
import { UserAvatar } from "@/components/UserAvatar";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

const page = async ({ params: { slug } }: { params: { slug: string } }) => {
  // const session = await getAuthSession();

  const userDetails = await db.user.findFirst({
    where: { username: slug },
    include: {
      Post: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subgroup: true,
        },
      },
      createdSubgroup: true,
    },
  });

  if (!userDetails) return notFound();

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        <ToFeedButton />
        <div className="mt-2 flex items-center  pb-4">
          <UserAvatar
            user={{
              name: userDetails?.name || null,
              image: userDetails?.image || null,
            }}
            className="h-8 w-8 mr-2"
          />
          <h1 className="font-bold text-3xl md:text-4xl"> Posts by u/{slug}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          {userDetails?.Post && (
            <ProfilePostFeed initialPosts={userDetails.Post} />
          )}
          {/* info sidebar */}
          <div className="flex flex-col">
            <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last mb-2">
              <div className="px-6 py-4">
                <p className="font-semibold py-3">
                  About u/{userDetails?.username || "u/" + slug}
                </p>
              </div>
              <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Real Name</dt>
                  <dd className="text-gray-700">
                    {userDetails?.name || "u/" + slug}
                  </dd>
                </div>
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Username</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-gray-900">{userDetails.username}</div>
                  </dd>
                </div>
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Email Address</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-gray-900">{userDetails.email}</div>
                  </dd>
                </div>
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Created groups</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-gray-900">
                      {userDetails?.createdSubgroup.length}
                    </div>
                  </dd>
                </div>
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Published Posts</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-gray-900">
                      {userDetails?.Post.length}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>

            {/* change line here */}
            <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
              <div className="px-6 py-4">
                <p className="font-semibold py-3">
                  Communities by u/{userDetails?.username || "u/" + slug}
                </p>
              </div>
              <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                {userDetails?.createdSubgroup.map((subgroup) => {
                  return (
                    <div className="flex justify-between gap-x-4 py-3">
                      <Link href={`/g/${subgroup.name}`}>
                        <dt className="text-gray-500 underline">
                          {subgroup.name}
                        </dt>
                      </Link>
                      <dd className="text-gray-700">
                        {format(subgroup.createdAt, "MMMM d, yyyy")}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
