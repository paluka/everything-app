-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followerCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0;


-- Add follower/following counts trigger
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment followerCount for the user being followed
    UPDATE "User"
    SET "followerCount" = "followerCount" + 1
    WHERE id = NEW."followingId";

    -- Increment followingCount for the user who is following
    UPDATE "User"
    SET "followingCount" = "followingCount" + 1
    WHERE id = NEW."followerId";
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement followerCount for the user being followed
    UPDATE "User"
    SET "followerCount" = "followerCount" - 1
    WHERE id = OLD."followingId";

    -- Decrement followingCount for the user who was following
    UPDATE "User"
    SET "followingCount" = "followingCount" - 1
    WHERE id = OLD."followerId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON "Follow"
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();


