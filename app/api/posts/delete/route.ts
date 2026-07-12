import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostDeleteValidator } from "@/lib/validators/post";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export async function DELETE(req: Request) {
  const requestId = crypto.randomUUID?.() ?? `${Date.now()}`;
  console.log(`[posts/delete:${requestId}] request started`, {
    method: req.method,
  });

  try {
    const session = await getAuthSession();
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;

    console.log(`[posts/delete:${requestId}] session check`, {
      hasSession: Boolean(session),
      userId: sessionUserId,
    });

    if (!session?.user) {
      console.warn(`[posts/delete:${requestId}] unauthorized: missing session`);
      return new Response("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (parseError) {
      console.warn(`[posts/delete:${requestId}] invalid JSON payload`, {
        error: parseError,
      });
      return new Response("Invalid request", { status: 400 });
    }

    console.log(`[posts/delete:${requestId}] parsed body`, body);

    const parsed = PostDeleteValidator.safeParse(body);
    if (!parsed.success) {
      console.warn(`[posts/delete:${requestId}] invalid payload`, {
        issues: parsed.error.flatten(),
      });
      return new Response("Invalid request", { status: 400 });
    }

    const { postId, authorId } = parsed.data;

    if (sessionUserId !== authorId) {
      console.warn(`[posts/delete:${requestId}] unauthorized: owner mismatch`, {
        sessionUserId,
        authorId,
      });
      return new Response("Unauthorized", { status: 401 });
    }

    const existingPost = await db.post.findFirst({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    console.log(`[posts/delete:${requestId}] post lookup result`, {
      postId,
      found: Boolean(existingPost),
      existingPost,
    });

    if (!existingPost) {
      console.warn(`[posts/delete:${requestId}] post not found`, { postId });
      return new Response("Post not found", { status: 404 });
    }

    if (existingPost.authorId !== authorId) {
      console.warn(`[posts/delete:${requestId}] author mismatch`, {
        postId,
        existingAuthorId: existingPost.authorId,
        authorId,
      });
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(
      `[posts/delete:${requestId}] clearing reply links for comments`,
      {
        postId,
      },
    );

    const updatedComments = await db.comment.updateMany({
      where: {
        postId,
      },
      data: {
        replyToId: null,
      },
    });

    console.log(`[posts/delete:${requestId}] comments updated`, {
      postId,
      updatedCount: updatedComments.count,
    });

    const deletedComments = await db.comment.deleteMany({
      where: {
        postId,
      },
    });

    console.log(`[posts/delete:${requestId}] comments deleted`, {
      postId,
      deletedCount: deletedComments.count,
    });

    await db.post.delete({
      where: {
        id: postId,
      },
    });

    console.log(`[posts/delete:${requestId}] delete successful`, { postId });
    return new Response("Post deleted", { status: 200 });
  } catch (error) {
    console.error(`[posts/delete:${requestId}] unexpected failure`, {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return new Response("Invalid request", { status: 400 });
    }

    if (error instanceof PrismaClientKnownRequestError) {
      console.error(`[posts/delete:${requestId}] prisma error details`, {
        code: error.code,
        meta: error.meta,
      });

      if (error.code === "P2025") {
        return new Response("Post not found", { status: 404 });
      }

      return new Response("Database error while deleting post", {
        status: 409,
      });
    }

    return new Response("Something went wrong", { status: 500 });
  }
}
