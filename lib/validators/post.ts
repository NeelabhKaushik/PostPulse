import { z } from "zod";

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .max(128, {
      message: "Title must be less than 128 characters long",
    }),
  subgroupId: z.string(),
  content: z.any(),
});

export const PostDeleteValidator = z.object({
  postId: z.string(),
  authorId: z.string(),
});

export type PostCreationRequest = z.infer<typeof PostValidator>;

export type PostDeleteRequest = z.infer<typeof PostDeleteValidator>;
