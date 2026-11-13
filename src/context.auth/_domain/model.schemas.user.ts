import { z } from 'zod';

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullish(),
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const userResourceSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
    emailVerifiedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type TUserType = z.infer<typeof userSchema>;

export type TUser = z.infer<typeof userResourceSchema>;
