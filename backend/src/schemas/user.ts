import { email, z } from "zod";

export const register_user_schema = z.object({
  email: z.email(),
  name: z.string().min(3, "EL nombre debe tener al menos 3 caracteres"),
  password: z.string().min(5, "La password debe tener al menos 5 caracteres"),
});

export const login_user_schema = z.object({
  email: z.email(),
  password: z.string(),
});
