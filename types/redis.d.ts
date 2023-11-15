import { VoteType } from "@prisma/client";

export type CachedPayload = {
    id:string,
    title:string,
    authorUsername: string,
    content: string,
    currentVote: VoteType | null,
    createdAt: Date,
}