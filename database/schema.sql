-- sql/schema.sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prisma
-- datasource db {
--     provider = "postgresql"
--     url      = env("DATABASE_URL")
-- }

-- generator client {
--     provider = "prisma-client-js"
-- }

-- model User {
--     id         Int      @id @default(autoincrement())
--     email      String   @unique
--     name       String?
--     createdAt  DateTime @default(now()) @map("created_at")

--     @@map("users")
-- }
