import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  PORT: z.string().optional().default("5000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DEV_SEED_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid/missing environment variables:", parsed.error.format());
  throw new Error("Missing required environment variables");
}

export const config = {
  DATABASE_URL: parsed.data.DATABASE_URL,
  PORT: Number(parsed.data.PORT),
  NODE_ENV: parsed.data.NODE_ENV,
  DEV_SEED_TOKEN: parsed.data.DEV_SEED_TOKEN,
};

export default config;
