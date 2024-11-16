"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function Messages() {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true, // This will make sure the session is required and fetched before rendering
    onUnauthenticated() {
      router.push("/login");
    },
  });

  return <div>My Messages</div>;
}

export default Messages;
