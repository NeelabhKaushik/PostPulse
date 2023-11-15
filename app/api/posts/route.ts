import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user?.id,
      },
      include: {
        subgroup: true,
      },
    });

    followedCommunitiesIds = followedCommunitiesIds.map(({ subg }) => subg.id);
  }

  try {
    const { limit, page, subgroupName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subgroupName: z.string().nullish().optional(),
      })
      .parse({
        subgroupName: url.searchParams.get("subgroupName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause = {};

    if (subgroupName) {
      whereClause = {
        subgroup: {
          name: subgroupName,
        },
      };
    } else if (session) {
      whereClause = {
        subgroup: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subgroup: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    error;
    if (error instanceof z.ZodError) {
      return new Response("Invalid request", { status: 400 });
    }

    return new Response(
      "Could not fetch more post",
      { status: 500 }
    );
  }
}