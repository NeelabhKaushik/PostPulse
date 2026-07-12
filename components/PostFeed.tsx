"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subgroupName?: string;
}

const PostFeed = ({ initialPosts, subgroupName }: PostFeedProps) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5,
  });
  const { data: session } = useSession();
  const [hasNoMore, setHasNoMore] = useState(false);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  const feedKey = subgroupName
    ? ["infinite-query", subgroupName]
    : ["infinite-query", session ? "custom-home" : "general-home"];

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(
      feedKey,
      async ({ pageParam = 1 }) => {
        const query =
          `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
          (!!subgroupName ? `&subgroupName=${subgroupName}` : "");

        const { data } = await axios.get(query);
        return data as ExtendedPost[];
      },

      {
        getNextPageParam: (lastPage, pages) => {
          // If we got fewer posts than the limit, there are no more pages
          if (lastPage.length < INFINITE_SCROLL_PAGINATION_RESULTS) {
            return undefined;
          }
          return pages.length + 1;
        },
        initialData: { pages: [initialPosts], pageParams: [1] },
      },
    );

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    } else {
      setShowEmptyAlert(true);
    }
  };

  return (
    <>
      <ul className="flex flex-col col-span-2 space-y-6">
        {posts.length === 0 ? (
          <li className="flex justify-center items-center py-12">
            <p className="text-zinc-500">
              No posts available. Join more groups!
            </p>
          </li>
        ) : (
          posts.map((post, index) => {
            const votesAmt = post.votes.reduce((acc: any, vote: any) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            }, 0);

            const currentVote = post.votes.find(
              //@ts-ignore
              (vote: any) => vote.userId === session?.user?.id,
            );

            if (index === posts.length - 1) {
              // Add a ref to the last post in the list
              return (
                <li key={post.id} ref={ref}>
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
          })
        )}

        {isFetchingNextPage && (
          <li className="flex justify-center">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </li>
        )}

        {posts.length > 0 && (
          <li className="flex justify-center pt-6">
            <Button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage || !hasNextPage}
              variant="outline"
            >
              {isFetchingNextPage ? (
                <></>
              ) : hasNextPage ? (
                "Load More Posts"
              ) : (
                "You are done for the day! Join more groups to discover more posts!"
              )}
            </Button>
          </li>
        )}
      </ul>

      <AlertDialog open={showEmptyAlert} onOpenChange={setShowEmptyAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>All Caught Up!</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached the end of your feed. Join more groups to discover
              more posts!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowEmptyAlert(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostFeed;
