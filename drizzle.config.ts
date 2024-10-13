import { defineConfig } from "drizzle-kit";

import { env } from "~/env.js";

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials:{
    url: env.DATABASE_URL
  }
}); 

