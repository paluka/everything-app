"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import messagesStyles from "./messages.module.scss";
import { IConversation, IConversationParticipants } from "@/types/entities";

function Messages() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession({
    required: true, // This will make sure the session is required and fetched before rendering
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const userIdString = session?.user?.id;

  const searchParams = useSearchParams();
  const messageReceiverUserId = searchParams.get("userId");
  // let messageReceiverUserId = "";

  // if (Array.isArray(userId)) {
  //   messageReceiverUserId = userId[0];
  // } else {
  //   messageReceiverUserId = userId;
  // }

  console.log("User ID string:", userIdString);
  console.log("Message receiver user ID string:", messageReceiverUserId);

  const memoizedFetchConversations = useCallback(
    async function fetchConversations() {
      if (isLoading || !userIdString || conversations) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations/user/${userIdString}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        const errorString = `Error fetching conversations for user ${userIdString}. Error: ${error}`;
        console.error(errorString);
        setError(errorString);
      } finally {
        setIsLoading(false);
      }
    },
    [conversations, isLoading, userIdString]
  );

  // const memoizedCheckConversationBetweenUsers = useCallback(
  //   async function checkConversationBetweenUsers() {
  //     if (isLoading || !userIdString || conversations) {
  //       return;
  //     }

  //     try {
  //       setIsLoading(true);
  //       setError("");

  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations/user/${userIdString}`
  //       );

  //       const data = await response.json();
  //       setConversations(data);
  //     } catch (error) {
  //       const errorString = `Error fetching conversations for user ${userIdString}. Error: ${error}`;
  //       console.error(errorString);
  //       setError(errorString);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [conversations, isLoading, userIdString]
  // );

  useEffect(() => {
    memoizedFetchConversations();
  }, [memoizedFetchConversations]);

  // useEffect(() => {
  //   memoizedCheckConversationBetweenUsers();
  // }, [memoizedCheckConversationBetweenUsers]);

  const conversationWithMessageReceiver =
    !isLoading &&
    !error &&
    messageReceiverUserId &&
    conversations.filter((conversationData: IConversation) =>
      //conversationData.participants.includes(messageReceiverUserId)
      conversationData.participants.some(
        (participant: IConversationParticipants) =>
          participant.id === messageReceiverUserId
      )
    );

  const handleCreateConversation = async () => {
    if (isLoading) {
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create the conversation");
      }

      const data = await response.json();
      console.log(`Create conversation response: ${JSON.stringify(data)}`);
    } catch (error) {
      const errorString = `Create conversation error: ${error}`;
      setError(errorString);
      console.error(errorString);
    } finally {
      setIsLoading(false);
    }
  };

  console.log({
    isLoading,
    error,
    conversations,
    conversationWithMessageReceiver,
    condition: !isLoading && !error && !!messageReceiverUserId,
  });

  return (
    <div className={messagesStyles.container}>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div className={messagesStyles.conversationList}>
        {!isLoading && !error && !!messageReceiverUserId ? (
          conversationWithMessageReceiver &&
          conversationWithMessageReceiver.length ? (
            conversationWithMessageReceiver.map(
              (conversationData: IConversation) => (
                <div key={conversationData.id}>{String(conversationData)}</div>
              )
            )
          ) : (
            <div>
              <button onClick={handleCreateConversation}>
                Create Conversation
              </button>
            </div>
          )
        ) : (
          ""
        )}

        {!isLoading &&
          !error &&
          conversations.map((conversationData: IConversation) => (
            <div key={conversationData.id}>{String(conversationData)}</div>
          ))}
      </div>

      <div className={messagesStyles.conversation}></div>
    </div>
  );
}

export default Messages;
