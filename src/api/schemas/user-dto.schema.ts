import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof UserSchema>;
