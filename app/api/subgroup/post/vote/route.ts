import { CACHE_AFTER_UPVOTES } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPayload } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });
        return new Response("Vote updated");
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      // recount the votes
      const voteAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") {
          return acc + 1;
        } else {
          return acc - 1;
        }
        return acc;
      }, 0);

      if (voteAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPayload = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${post.id}`, cachePayload);
      }

      return new Response("Done");
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    });

    const voteAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") {
        return acc + 1;
      } else {
        return acc - 1;
      }
      return acc;
    }, 0);

    if (voteAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPayload = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${post.id}`, cachePayload);
    }

    return new Response("Done");
  } catch (error) {
    error;
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not Vote to this subgroup now. Please try again",
      { status: 500 }
    );
  }
}
