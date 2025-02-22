import { z } from "zod";

export const UserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().jwt(),
});
