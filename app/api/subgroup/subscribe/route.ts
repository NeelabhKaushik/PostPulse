import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubgroupSubscriptionValidator } from '@/lib/validators/subgroup'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { subgroupId } = SubgroupSubscriptionValidator.parse(body)

    // check if user has already subscribed to subgroup
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subgroupId,
        userId: session.user.id,
      },
    })

    if (subscriptionExists) {
      return new Response("You've already subscribed to this subgroup", {
        status: 400,
      })
    }

    // create subgroup and associate it with the user
    await db.subscription.create({
      data: {
        subgroupId,
        userId: session.user.id,
      },
    })

    return new Response(subgroupId)
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not subscribe to subgroup at this time. Please try later',
      { status: 500 }
    )
  }
}