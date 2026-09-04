import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

function booleanString(defaultValue: boolean) {
  return z
    .string()
    .optional()
    .transform((v) =>
      v === undefined || v === ""
        ? defaultValue
        : v.trim().toLowerCase() === "true",
    );
}

/**
 * All process.env access in the application must go through this module.
 * Fail fast at startup if a required variable is missing or malformed —
 * never surface a config error mid-request.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  CORS_ORIGINS: z
    .string()
    .min(1, "CORS_ORIGINS must list at least one allowed origin"),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1),
  DB_SSL: booleanString(false),
  DB_POOL_MAX: z.coerce.number().int().positive().default(20),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  REFRESH_COOKIE_NAME: z.string().default("jomdekan_rt"),
  COOKIE_SECRET: z
    .string()
    .min(16, "COOKIE_SECRET must be at least 16 characters"),

  STORAGE_PROVIDER: z
    .enum(["local-stub", "s3", "supabase"])
    .default("local-stub"),
  STORAGE_BUCKET: z.string().default("jomdekan-resources"),
  STORAGE_ENDPOINT: z.string().optional().default(""),
  STORAGE_ACCESS_KEY_ID: z.string().optional().default(""),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional().default(""),

  REDIS_URL: z.string().optional().default(""),

  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  EMAIL_FROM: z.string().email().default("no-reply@jomdekan.app"),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().int().positive().default(20),
});

type RawEnv = z.infer<typeof envSchema>;

function parseEnv(): RawEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration:");
    for (const issue of parsed.error.issues) {
      // eslint-disable-next-line no-console
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Environment validation failed. See errors above.");
  }
  return parsed.data;
}

const raw = parseEnv();

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
  port: raw.PORT,

  corsOrigins: raw.CORS_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  db: {
    host: raw.DB_HOST,
    port: raw.DB_PORT,
    user: raw.DB_USER,
    password: raw.DB_PASSWORD,
    database: raw.DB_NAME,
    ssl: raw.DB_SSL,
    poolMax: raw.DB_POOL_MAX,
  },

  jwt: {
    accessSecret: raw.JWT_ACCESS_SECRET,
    refreshSecret: raw.JWT_REFRESH_SECRET,
    accessExpiresIn: raw.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: raw.JWT_REFRESH_EXPIRES_IN,
    refreshCookieName: raw.REFRESH_COOKIE_NAME,
  },
  cookieSecret: raw.COOKIE_SECRET,

  storage: {
    provider: raw.STORAGE_PROVIDER,
    bucket: raw.STORAGE_BUCKET,
    endpoint: raw.STORAGE_ENDPOINT,
    accessKeyId: raw.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: raw.STORAGE_SECRET_ACCESS_KEY,
  },

  redisUrl: raw.REDIS_URL,

  email: {
    provider: raw.EMAIL_PROVIDER,
    from: raw.EMAIL_FROM,
  },

  google: {
    clientId: raw.GOOGLE_CLIENT_ID,
    clientSecret: raw.GOOGLE_CLIENT_SECRET,
  },

  rateLimit: {
    windowMs: raw.RATE_LIMIT_WINDOW_MS,
    maxAuth: raw.RATE_LIMIT_MAX_AUTH,
  },
};
