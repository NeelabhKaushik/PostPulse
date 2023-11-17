"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Post from "./Post";

interface ProfilePostFeedProps {
  initialPosts: ExtendedPost[];
}

const ProfilePostFeed = ({ initialPosts }: ProfilePostFeedProps) => {
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
            />
          );
        }
      })}
    </ul>
  );
};

export default ProfilePostFeed;
