CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"workId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genre_name_unique" UNIQUE("name"),
	CONSTRAINT "genre_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "musician_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"displayName" text NOT NULL,
	"bio" text,
	"primaryGenre" text,
	"imageUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "musician_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"artworkUrl" text,
	"createdDate" date,
	"releaseDate" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" serial PRIMARY KEY NOT NULL,
	"workId" integer NOT NULL,
	"reporterId" text,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'MUSICIAN' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"projectId" integer,
	"genreId" integer,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"createdDate" date,
	"releasedDate" date,
	"duration" integer,
	"composer" text,
	"lyricist" text,
	"producer" text,
	"recording" text,
	"version" text,
	"audioUrl" text NOT NULL,
	"artworkUrl" text,
	"lyrics" text,
	"fileSize" integer,
	"format" text,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"playCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;