"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import messagesStyles from "./messages.module.scss";
import { IConversation, IConversationMessage } from "@/types/entities";
import { formatDate } from "@/utils/formatDate";
import { getSocket } from "../../utils/socket";

function Messages() {
  const conversationMessagesRef = useRef(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [conversationList, setConversationList] = useState<IConversation[]>([]);
  const [openConversation, setOpenConversation] = useState<IConversation>();
  const [lastOpenConversationId, setLastOpenConversationId] =
    useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession({
    required: true, // This will make sure the session is required and fetched before rendering
    onUnauthenticated() {
      router.push("/login");
    },
  });

  // console.log("Session user data", { sessionUser: session?.user });

  const userIdString = session?.user?.id;

  const searchParams = useSearchParams();
  const messageReceiverUserId = searchParams.get("userId");
  // let messageReceiverUserId = "";

  // if (Array.isArray(userId)) {
  //   messageReceiverUserId = userId[0];
  // } else {
  //   messageReceiverUserId = userId;
  // }

  // console.log("User ID string:", userIdString);
  // console.log("Message receiver user ID string:", messageReceiverUserId);

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
    // Scroll to the bottom when the messages change
    if (conversationMessagesRef.current) {
      (conversationMessagesRef.current as HTMLDivElement).scrollTop = (
        conversationMessagesRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [openConversation?.messages]);

  useEffect(() => {
    if (!userIdString) {
      return;
    }
    const socket = getSocket(userIdString);

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    // socket.on("receiveMessage", (message) => {
    //   console.log("New WebSocket message received:", message);
    // });

    socket.on("receiveMessage", (newMessage: IConversationMessage) => {
      console.log("Received a new websocket message", { newMessage });
      console.log(
        newMessage.conversationId,
        lastOpenConversationId,
        newMessage.conversationId === lastOpenConversationId
      );

      addNewMessageToConversationsState(newMessage);

      // if (newMessage.conversationId === lastOpenConversationId) {
      //   setOpenConversation((prevConversation) => ({
      //     ...prevConversation!,
      //     messages: [...prevConversation!.messages, newMessage],
      //   }));
      // }
      // // const conversation = conversationList.find(
      // //   (conversationItem: IConversation) =>
      // //     conversationItem.id === newMessage.conversationId
      // // );

      // setConversationList((prevList: IConversation[]) => {
      //   const updatedList = prevList.map((conversationItem: IConversation) => {
      //     if (conversationItem.id === newMessage.conversationId) {
      //       return {
      //         ...conversationItem,
      //         messages: [...conversationItem.messages, newMessage],
      //       };
      //     }
      //     return conversationItem;
      //   });

      //   return updatedList;
      // });

      //     ...openConversation.messages!,
      //     messageData as IConversationMessage,
      //   ],
      // });
    });

    socket.on(
      "messageSent",
      (response: {
        success: boolean;
        error: any;
        message: IConversationMessage;
      }) => {
        console.log("New WebSocket message sent acknowledgement:", response);

        if (!response.success) {
          addStatusSendErrorToNewMessage(response.message);
        }
      }
    );

    socket.on("newMessageNotification", (message) => {
      console.log(
        "New WebSocket message in conversation notification received:",
        { message }
      );
      // Optionally, update state or show a toast notification
    });

    return () => {
      socket.off("receiveMessage"); // Clean up event listeners
      socket.off("messageSent");
      socket.off("newMessageNotification");
      // Optionally, disconnect socket if no other components need it
      // socket.disconnect();
    };
  }, [userIdString, lastOpenConversationId]);

  useEffect(() => {
    async function fetchConversations() {
      // console.log("Fetch conversations", {
      //   isLoading,
      //   userIdString,
      //   hasFetched,
      // });
      if (isLoading || !userIdString || hasFetched) {
        return;
      }

      // console.log("Fetching conversations");
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations/user/${userIdString}`
        );

        // console.log("Fetching conversations:", { response });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        // console.log("Received conversations", { data });
        setConversationList(data);
      } catch (error) {
        const errorString = `Error fetching conversations for user ${userIdString}. Error: ${error}`;
        console.error(errorString);
        setError(errorString);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    }

    fetchConversations();
  }, [hasFetched, isLoading, userIdString]);

  function addNewMessageToConversationsState(newMessage: IConversationMessage) {
    if (newMessage.conversationId === lastOpenConversationId) {
      setOpenConversation((prevConversation) => ({
        ...prevConversation!,
        messages: [...prevConversation!.messages, newMessage],
      }));
    }

    setConversationList((prevList: IConversation[]) => {
      const updatedList = prevList.map((conversationItem: IConversation) => {
        if (conversationItem.id === newMessage.conversationId) {
          return {
            ...conversationItem,
            messages: [...conversationItem.messages, newMessage],
          };
        }
        return conversationItem;
      });

      return updatedList;
    });
  }
  function addStatusSendErrorToNewMessage(newMessage: IConversationMessage) {
    console.log("Removing new message from conversatios state");
    if (!openConversation || !conversationList.length) {
      return;
    }
    console.log("Past guard: Removing new message from conversatios state");

    const editedNewMessage = {
      ...newMessage,
      // content:
      //   newMessage.content + " Error: Failed to send message. Try again.",
      status: "failed",
    };

    if (newMessage.conversationId === lastOpenConversationId) {
      setOpenConversation((prevConversation) => ({
        ...prevConversation!,
        messages: [
          ...prevConversation!.messages.slice(0, -1),
          editedNewMessage,
        ] as IConversationMessage[],
      }));
    }

    setConversationList((prevList: IConversation[]) => {
      const updatedList = prevList.map((conversationItem: IConversation) => {
        if (conversationItem.id === newMessage.conversationId) {
          return {
            ...conversationItem,
            messages: [
              ...conversationItem!.messages.slice(0, -1),
              editedNewMessage,
            ] as IConversationMessage[],
          };
        }
        return conversationItem;
      });

      return updatedList;
    });
  }
  // useEffect(() => {
  //   memoizedCheckConversationBetweenUsers();
  // }, [memoizedCheckConversationBetweenUsers]);

  // const conversationWithMessageReceiver = useMemo(
  //   () =>
  //     !isLoading &&
  //     !error &&
  //     messageReceiverUserId &&
  //     conversationList.filter((conversationData: IConversation) =>
  //       //conversationData.participants.includes(messageReceiverUserId)
  //       conversationData.participants.some(
  //         (participant: IConversationParticipant) =>
  //           participant.id === messageReceiverUserId
  //       )
  //     ),
  //   [conversationList, error, isLoading, messageReceiverUserId]
  // );

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // async function handleCreateConversation() {
  //   if (isLoading) {
  //     return;
  //   }

  //   const conversationData = {
  //     // name: "Conversation between User A and User B",
  //     participants: [
  //       { userId: userIdString }, // User A
  //       { userId: messageReceiverUserId }, // User B
  //     ],
  //     messages: [
  //       {
  //         content: "Hello, how are you?",
  //         senderId: userIdString, // User A is sending the first message
  //       },
  //     ],
  //   };

  //   try {
  //     setError("");
  //     setIsLoading(true);

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(conversationData),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to create the conversation");
  //     }

  //     const data = await response.json();
  //     console.log(`Create conversation response: ${JSON.stringify(data)}`);
  //   } catch (error) {
  //     const errorString = `Create conversation error: ${error}`;
  //     setError(errorString);
  //     console.error(errorString);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // console.log({
  //   isLoading,
  //   error,
  //   conversationList,
  //   conversationWithMessageReceiver,
  //   condition: !isLoading && !error && !!messageReceiverUserId,
  // });

  function handleOpenConversation(conversation: IConversation) {
    if (!userIdString || conversation.id === lastOpenConversationId) {
      return;
    }
    setOpenConversation(conversation);
    setLastOpenConversationId(conversation.id);

    // const socket = getSocket(userIdString);

    // console.log("joining room", conversation.id);
    // socket.emit("joinRoom", conversation.id);

    // Listen for new messages
    // socket.on("receiveMessage", (newMessage) => {
    //   console.log("Received a new websocket message", newMessage);

    //   setOpenConversation((prevConversation) => ({
    //     ...prevConversation!,
    //     messages: [...prevConversation!.messages, newMessage],
    //   }));
    //   //     ...openConversation.messages!,
    //   //     messageData as IConversationMessage,
    //   //   ],
    //   // });
    // });

    console.log("Open conversation", { conversation });
  }

  // function handleSendWebSocketMessage(content) {
  //   socket.emit("sendMessage", {
  //     conversationId,
  //     senderId: userId,
  //     message: content,
  //   });
  // }

  async function handleSendMessage(conversation: IConversation) {
    if (
      !userIdString ||
      isLoading ||
      error ||
      !textContent ||
      !openConversation
    ) {
      return;
    }

    const messageData: Partial<IConversationMessage> = {
      content: textContent,
      sender: {
        ...session?.user,
      },
      conversation: {
        id: conversation.id,
      },
    } as Partial<IConversationMessage>;

    try {
      setError("");
      setIsLoading(true);

      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(messageData),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error("Failed to send the message");
      // }
      const socket = getSocket(userIdString);

      const webSocketMessage = {
        conversationId: conversation.id,
        senderId: userIdString,
        content: textContent,
        sender: session?.user,
        conversation: {
          id: conversation.id,
        },
        createdAt: new Date().toString(),
      } as IConversationMessage;

      console.log("Sending message over WebSockets:", webSocketMessage);
      socket.emit("sendMessage", webSocketMessage);

      // const data = await response.json();
      // console.log(`Send message response: ${JSON.stringify(data)}`);
      setTextContent("");
      addNewMessageToConversationsState(webSocketMessage);
    } catch (error) {
      const errorString = `Send message error: ${error}`;
      setError(errorString);
      console.error(errorString);
    } finally {
      setIsLoading(false);
    }
  }

  // if (openConversation) {
  //   console.log("Open Conversation", { openConversation });
  // }

  return (
    <div className={messagesStyles.container}>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div className={messagesStyles.conversationList}>
        {/* {!isLoading && !error && !!messageReceiverUserId ? (
          conversationWithMessageReceiver &&
          conversationWithMessageReceiver.length ? (
            conversationWithMessageReceiver.map(
              (conversationData: IConversation) => (
                <div key={conversationData.id}>
                  {conversationData.participants.map((participantItem) => (
                    <div key={participantItem.id}>
                      {participantItem.user.name}
                    </div>
                  ))}
                </div>
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
        )} */}

        {!isLoading &&
          !error &&
          conversationList.map((conversationData: IConversation) => (
            <div key={conversationData.id}>
              {conversationData.participants
                .filter(
                  (partcipantElement) =>
                    partcipantElement.userId !== userIdString
                )
                .map((participantItem) => {
                  if (
                    messageReceiverUserId &&
                    participantItem.userId === messageReceiverUserId &&
                    !openConversation
                  ) {
                    setOpenConversation(conversationData);
                  }

                  return (
                    <div
                      className={messagesStyles.conversationItem}
                      key={participantItem.id}
                      onClick={() => handleOpenConversation(conversationData)}
                    >
                      {participantItem.user.name}
                    </div>
                  );
                })}
            </div>
          ))}
      </div>

      <div className={messagesStyles.conversationMessagesContainer}>
        {openConversation && (
          <>
            <div
              ref={conversationMessagesRef}
              className={messagesStyles.conversationMessages}
            >
              {openConversation?.messages!.map((message, index) => (
                <div key={index} className={messagesStyles.messageContainer}>
                  <div className={messagesStyles.messageContent}>
                    {message.content}
                  </div>
                  <div className={messagesStyles.messageSender}>
                    <Image
                      className={messagesStyles.profileImage}
                      src={message.sender.image}
                      alt="Profile Image"
                      width={15}
                      height={15}
                    />
                    {message.sender.name}
                  </div>

                  <div className={messagesStyles.messageStatusDate}>
                    {`${formatDate(message.createdAt)}`}

                    <div className={messagesStyles.messageStatus}>
                      {/* {`Status: ${message.status}`} */}
                      {message.status === "failed" && (
                        <div
                          className={messagesStyles.statusIcon}
                          title="Failed to send"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="red"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                        </div>
                      )}
                      {message.status === "sent" && (
                        <div className={messagesStyles.statusIcon} title="Sent">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#999"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      )}
                      {message.status === "sent" && (
                        <div
                          className={messagesStyles.statusIcon}
                          title="Delivered"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#4CAF50"
                          >
                            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                          </svg>
                        </div>
                      )}
                      {message.status === "sent" && (
                        <div className={messagesStyles.statusIcon} title="Read">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#0088ff"
                          >
                            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={messagesStyles.messageTextContainer}>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <button onClick={() => handleSendMessage(openConversation)}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;
