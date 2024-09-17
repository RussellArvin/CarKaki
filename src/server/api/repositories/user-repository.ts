import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class UserRepository {
    constructor(private readonly db: PostgresJsDatabase) {}
}