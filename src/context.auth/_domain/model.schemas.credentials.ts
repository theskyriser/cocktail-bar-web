import z from 'zod';

export const credentialsSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Please enter a password'),
});

export type TCredentials = z.infer<typeof credentialsSchema>;
