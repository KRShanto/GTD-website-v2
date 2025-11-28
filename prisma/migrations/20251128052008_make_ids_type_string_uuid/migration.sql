/*
  Warnings:

  - The primary key for the `authors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `blogs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `gallery-images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `gallery-videos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `testimonials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_author_id_fkey";

-- AlterTable
ALTER TABLE "authors" DROP CONSTRAINT "authors_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "authors_id_seq";

-- AlterTable
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "blogs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "blogs_id_seq";

-- AlterTable
ALTER TABLE "gallery-images" DROP CONSTRAINT "gallery-images_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "gallery-images_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "gallery-images_id_seq";

-- AlterTable
ALTER TABLE "gallery-videos" DROP CONSTRAINT "gallery-videos_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "gallery-videos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "gallery-videos_id_seq";

-- AlterTable
ALTER TABLE "team" DROP CONSTRAINT "team_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "team_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "team_id_seq";

-- AlterTable
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "testimonials_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
