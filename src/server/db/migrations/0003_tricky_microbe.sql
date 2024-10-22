CREATE TABLE IF NOT EXISTS "public_holiday" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"day" date NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
