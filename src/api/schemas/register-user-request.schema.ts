import { z } from "zod";

export const RegisterUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>;
