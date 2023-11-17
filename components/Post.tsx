"use client";

import { toast } from "@/hooks/use-toast";
import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { DeleteIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PostDeleteRequest } from "@/lib/validators/post";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  votesAmt: number;
  subgroupName: string;
  currentVote?: PartialVote;
  commentAmt: number;
  whereRender?: string;
}

const Post = ({
  post,
  votesAmt: votesAmt,
  currentVote: currentVote,
  subgroupName,
  commentAmt,
  whereRender,
}: PostProps) => {
  const pRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const { mutate: deletePost } = useMutation({
    mutationFn: async ({ postId, authorId }: PostDeleteRequest) => {
      const payload: PostDeleteRequest = {
        postId: postId,
        authorId,
      };
      const { data } = await axios.delete("/api/posts/delete", {
        data: payload,
      });

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "You are not authorised you silly goose.",
            description: "Please login from orignal account.",
            variant: "destructive",
          });
        }

        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error.",
        description: "Could not delete your post.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Post deleted!",
        description: `The post is now deleted`,
      });
      router.refresh();
    },
  });

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subgroupName ? (
              <>
                <a
                  className="underline text-zinc-900 text-sm underline-offset-2"
                  href={`/g/${subgroupName}`}
                >
                  g/{subgroupName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>
              Posted by{" "}
              <Link href={`/u/${post?.author.username}`} className="underline">
                u/{post?.author.username}
              </Link>
            </span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/g/${subgroupName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-end bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6 justify-between">
        <Link
          href={`/g/${subgroupName}/post/${post.id}`}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" /> {commentAmt} comments
        </Link>

        {// @ts-ignore
        whereRender && session?.user?.id === post.authorId && (
          <AlertDialog>
            <AlertDialogTrigger>
              <DeleteIcon className="h-4 w-4" color="red"></DeleteIcon>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    // @ts-ignore
                    deletePost({ postId: post.id, authorId: post.authorId });
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};
export default Post;
function loginToast(): unknown {
  throw new Error("Function not implemented.");
}
