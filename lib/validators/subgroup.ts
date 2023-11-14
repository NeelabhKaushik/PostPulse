import { z } from "zod";

export const SubgroupValidator = z.object({
  name: z.string().min(3).max(21),
});

export const SubgroupSubscriptionValidator = z.object({
  subgroupId: z.string(),
});

export type CreateSubgroupPayload = z.infer<typeof SubgroupValidator>;
export type SubscribeToSubgroupPayload = z.infer<
  typeof SubgroupSubscriptionValidator
>;
