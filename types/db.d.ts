import { Subgroup, User, Vote, Comment } from "@prisma/client";

export type ExtendedPost = Post & {
  subgroup: Subgroup;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
