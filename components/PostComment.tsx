"use client";

import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import { Comment, CommentVote } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import CommentsVote from "./CommentsVote";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
  authorUsername: string;
}
const PostComment = ({
  comment,
  votesAmt,
  currentVote,
  postId,
  authorUsername,
}: PostCommentProps) => {
  const commentRef = useRef(null);
  const router = useRouter();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const { data: session } = useSession();

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(`/api/subgroup/post/comment`, payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Something Went Wrong",
        description: "Comment was not posted, Please try Again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });
  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <Link href={`/u/${authorUsername}`} className="underline">
            <p className="text-sm font-medium text-gray-900">
              u/{authorUsername}
            </p>
          </Link>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>
      <div className="flex gap-2 items-center flex-wrap">
        <CommentsVote
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />
        <Button
          variant={"ghost"}
          size="xs"
          aria-label="reply"
          onClick={() => {
            if (!session) {
              return router.push("/sign-in");
            }
            setIsReplying(true);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant={"subtle"}
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={input.length === 0}
                  onClick={() => {
                    if (!input) return;
                    postComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
