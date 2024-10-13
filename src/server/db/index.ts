import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless"

import { env } from "~/env.js";
import * as schema from "./schema";

export const db = drizzle(neon(env.DATABASE_URL));
