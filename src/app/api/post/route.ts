// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch posts from the database
    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", // Orders posts from most recent to oldest
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts", error);
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  const { content, userId } = await request.json();

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    console.log("New post created", newPost);
    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Error creating post", error);
    return NextResponse.error();
  }
}
