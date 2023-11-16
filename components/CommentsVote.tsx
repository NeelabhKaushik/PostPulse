"use client";

import { useCustomToasts } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface CommentsVoteProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: Pick<CommentVote, "type">;
}
const CommentsVote = ({
  commentId,
  initialVotesAmt,
  initialVote,
}: CommentsVoteProps) => {
  const { loginToast } = useCustomToasts();
  const [voteAmt, setVoteAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const prevVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType: type,
      };

      await axios.patch("/api/subgroup/post/comment/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVoteAmt((prev) => prev - 1);
      else setVoteAmt((prev) => prev + 1);

      // reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Couldnt vote the post. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote?.type === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);
        if (type === "UP") setVoteAmt((prev) => prev - 1);
        else if (type === "DOWN") setVoteAmt((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote({ type });
        if (type === "UP") setVoteAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex gap-1">
      {/* upvote */}
      <Button
        onClick={() => vote("UP")}
        size="xs"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      {/* score */}
      <p className="text-center py-2 px-1 font-medium text-xs text-zinc-900">
        {voteAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote("DOWN")}
        size="xs"
        className={cn({
          "text-emerald-500": currentVote?.type === "DOWN",
        })}
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentsVote;
