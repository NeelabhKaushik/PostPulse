import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    const { postId, authorId } = body;

    const posts = db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        author: true,
      },
    });

    if (!posts) {
      return new Response("Post not found", { status: 404 });
    }

    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response("Post deleted");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request", { status: 400 });
    }

    return new Response("something went wrong", { status: 500 });
  }
}
