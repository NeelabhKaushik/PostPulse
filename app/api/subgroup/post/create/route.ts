import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, content, subgroupId } = PostValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // verify user is subscribed to passed subgroup id
    const subscription = await db.subscription.findFirst({
      where: {
        subgroupId,
        //@ts-ignore
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return new Response("Subscribe to post", { status: 403 });
    }

    await db.post.create({
      data: {
        title,
        content,
        //@ts-ignore
        authorId: session.user.id,
        subgroupId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid request data passed", { status: 400 });
    }

    return new Response(
      "Could not post to subgroup at this time. Please try later",
      { status: 500 }
    );
  }
}
