import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.create({
      data: {
        text,
        postId,
        //@ts-ignore
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("Commented to post");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid request data passed", { status: 400 });
    }

    return new Response(
      "Could not comment to post at this time. Please try later",
      { status: 500 }
    );
  }
}
