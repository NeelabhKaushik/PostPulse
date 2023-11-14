import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubgroupValidator } from '@/lib/validators/subgroup'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = SubgroupValidator.parse(body)

    // check if Subgroup already exists
    const subgroupExists = await db.subgroup.findFirst({
      where: {
        name,
      },
    })

    if (subgroupExists) {
      return new Response('Subgroup already exists', { status: 409 })
    }

    // create subgroup and associate it with the user
    const subgroup = await db.subgroup.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subgroupId: subgroup.id,
      },
    })

    return new Response(subgroup.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create subgroup', { status: 500 })
  }
}