import { z } from "zod";

export const refreshTokenSchema = z.object({
  refreshToken: z.string().jwt(),
});
