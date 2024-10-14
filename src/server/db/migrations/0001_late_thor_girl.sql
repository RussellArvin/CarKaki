DO $$ BEGIN
 CREATE TYPE "public"."parking_system_enum" AS ENUM('INFO', 'AVAIL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_type_enum" AS ENUM('C', 'H', 'Y');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "car_park" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"vehicle_category" "lot_type_enum" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"weekday_rate" numeric(5, 2) NOT NULL,
	"weekday_min" integer NOT NULL,
	"sat_rate" numeric(5, 2) NOT NULL,
	"sat_min" integer NOT NULL,
	"sun_ph_rate" numeric(5, 2) NOT NULL,
	"sun_ph_min" integer NOT NULL,
	"parking_system" "parking_system_enum" NOT NULL,
	"capacity" integer NOT NULL,
	"available_lots" integer NOT NULL,
	"location" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parking_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"car_park_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "parking_system_enum" NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ura_token" (
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"is_dark_mode" boolean DEFAULT false NOT NULL,
	"is_notifications_enabled" boolean DEFAULT false NOT NULL,
	"home_car_park_id" uuid,
	"work_car_park_id" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_favourite" (
	"car_park_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_favourite_car_park_id_user_id_pk" PRIMARY KEY("car_park_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_review" (
	"car_park_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_review_car_park_id_user_id_pk" PRIMARY KEY("car_park_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parking_history" ADD CONSTRAINT "parking_history_car_park_id_car_park_id_fk" FOREIGN KEY ("car_park_id") REFERENCES "public"."car_park"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parking_history" ADD CONSTRAINT "parking_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_home_car_park_id_car_park_id_fk" FOREIGN KEY ("home_car_park_id") REFERENCES "public"."car_park"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_work_car_park_id_car_park_id_fk" FOREIGN KEY ("work_car_park_id") REFERENCES "public"."car_park"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_favourite" ADD CONSTRAINT "user_favourite_car_park_id_car_park_id_fk" FOREIGN KEY ("car_park_id") REFERENCES "public"."car_park"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_favourite" ADD CONSTRAINT "user_favourite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_review" ADD CONSTRAINT "user_review_car_park_id_car_park_id_fk" FOREIGN KEY ("car_park_id") REFERENCES "public"."car_park"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_review" ADD CONSTRAINT "user_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
