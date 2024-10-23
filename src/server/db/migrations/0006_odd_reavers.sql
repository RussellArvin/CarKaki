ALTER TABLE "user_favourite" DROP CONSTRAINT "user_favourite_car_park_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "user_favourite" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;