import {z} from 'zod';

export const SendMessageValidator = z.object({
    message: z.string().min(1).max(10000),
    fileId: z.string(),
})