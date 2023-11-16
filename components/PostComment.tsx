"use client";

import React, { useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { Comment, CommentVote } from "@prisma/client";
import { User } from "next-auth";
import { formatTimeToNow } from "@/lib/utils";
import CommentsVote from "./CommentsVote";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
}
const PostComment = ({ comment, votesAmt, currentVote }: PostCommentProps) => {
  const commentRef = useRef(null);
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
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.name}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>
      <div className="flex gap-2 items-center">
        <CommentsVote
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />
        <Button variant={"ghost"} size="xs" aria-label="reply" onClick={()=> {}}>
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
      </div>
    </div>
  );
};

export default PostComment;
