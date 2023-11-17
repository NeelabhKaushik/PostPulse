"use client";

import { ExtendedPost } from "@/types/db";
import { useSession } from "next-auth/react";
import Post from "./Post";

interface ProfilePostFeedProps {
  initialPosts: ExtendedPost[];
}

const ProfilePostFeed = ({ initialPosts }: ProfilePostFeedProps) => {
  const { data: session } = useSession();
  const posts = initialPosts?.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc: any, vote: any) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          //@ts-ignore
          (vote: any) => vote.userId === session?.user?.id
        );

        if (index === posts.length - 1) {
          // Add a ref to the last post in the list
          return (
            <li key={post.id}>
              <Post
                post={post}
                commentAmt={post.comments.length}
                subgroupName={post.subgroup.name}
                votesAmt={votesAmt}
                currentVote={currentVote}
                whereRender="profile"
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              commentAmt={post.comments.length}
              subgroupName={post.subgroup.name}
              votesAmt={votesAmt}
              currentVote={currentVote}
              whereRender="profile"
            />
          );
        }
      })}
    </ul>
  );
};

export default ProfilePostFeed;
