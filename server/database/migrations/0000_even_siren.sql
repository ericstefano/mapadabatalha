CREATE TABLE IF NOT EXISTS "battle" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"instagram" text NOT NULL,
	"lat" real NOT NULL,
	"lon" real NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp
);
