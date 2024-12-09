"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import messagesStyles from "./messages.module.scss";
import {
  IConversation,
  IConversationMessage,
  IConversationParticipant,
  IUserProfile,
  MessageStatusEnum,
} from "@/types/entities";
import { formatDate } from "@/utils/formatDate";
import { getSocket } from "../../utils/socket";
import { countUnreadMessages } from "@/utils/countUnreadMessages";
import MessageStatus from "../components/messageStatus";
import { encryptMessage } from "@/utils/crypto/encryptMessage";
import { useSessionUserProfileContext } from "../hooks/useSessionUserProfileContext";
import { decryptPrivateKey } from "@/utils/crypto/decryptPrivateKey";
import { decryptMessage } from "@/utils/crypto/decryptMessage";
import logger from "@/utils/logger";

const CONTEXT_MENU_HEIGHT = 40;

function Messages() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: IConversationMessage | null;
  } | null>(null);
  const conversationMessagesRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [conversationList, setConversationList] = useState<IConversation[]>([]);
  const [openConversation, setOpenConversation] =
    useState<IConversation | null>(null);
  const [lastOpenConversationId, setLastOpenConversationId] =
    useState<string>("");
  const [messageReceiverUserProfile, setMessageReceiverUserProfile] =
    useState<IUserProfile | null>(null);

  const [textContent, setTextContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const { data: session } = useSession({
    required: true, // This will make sure the session is required and fetched before rendering
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const userIdString = session?.user?.id;

  const searchParams = useSearchParams();
  const messageReceiverUserId = searchParams.get("userId");

  const { sessionUserProfile } = useSessionUserProfileContext();

  useEffect(() => {
    async function getMessageReceiverUserProfile() {}

    if (messageReceiverUserId) {
      getMessageReceiverUserProfile();
    }
  }, [messageReceiverUserId]);

  // Close the context menu when left clicking outside of it
  useEffect(() => {
    const handleClick = () => setContextMenu(null);

    if (contextMenu) {
      document.addEventListener("click", handleClick);
      document.addEventListener("contextmenu", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("contextmenu", handleClick);
      };
    }
  }, [contextMenu]);

  useEffect(() => {
    // Scroll to the bottom when the messages change
    if (conversationMessagesRef.current) {
      (conversationMessagesRef.current as HTMLDivElement).scrollTop = (
        conversationMessagesRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [openConversation?.messages]);

  const addNewMessageToConversationsState = useCallback(
    async function (newMessage: IConversationMessage) {
      if (
        !sessionUserProfile ||
        !sessionUserProfile.encryptedPrivateKey ||
        !sessionUserProfile.secret
      ) {
        logger.error("Unable to add new sent messages", { sessionUserProfile });
        return;
      }
      const decryptedPrivateKey = await decryptPrivateKey(
        sessionUserProfile.encryptedPrivateKey,
        sessionUserProfile.secret
      );

      const decryptedMessageContent = await decryptMessage(
        newMessage.senderId == sessionUserProfile.id
          ? newMessage.encryptedContentForSender
          : newMessage.encryptedContentForReceiver,
        decryptedPrivateKey
      );

      logger.log(`Decrypted message content`, decryptedMessageContent);

      newMessage.decryptedContent = decryptedMessageContent;

      if (newMessage.conversationId === lastOpenConversationId) {
        setOpenConversation((prevConversation: IConversation | null) => {
          if (prevConversation) {
            return {
              ...prevConversation,
              messages: [...prevConversation!.messages, newMessage],
            };
          }
          return null;
        });
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
    },
    [lastOpenConversationId, sessionUserProfile]
  );

  const updateMessageStatus = useCallback(
    function (
      newMessage: IConversationMessage,
      newMessageStatus: MessageStatusEnum
    ) {
      logger.log("Updating message status", newMessageStatus);

      if (!openConversation || !conversationList.length) {
        return;
      }

      // const editedNewMessage = {
      //   ...newMessage,
      //   status: newMessageStatus,
      // };

      if (newMessage.conversationId === lastOpenConversationId) {
        setOpenConversation((prevConversation: IConversation | null) => {
          if (prevConversation) {
            return {
              ...prevConversation,
              messages: [
                ...prevConversation!.messages.map((messageItem) => {
                  if (messageItem.id === newMessage.id) {
                    return {
                      ...newMessage,
                      status: newMessageStatus,
                      decryptedContent: messageItem.decryptedContent,
                    };
                  } else if (
                    !messageItem.id &&
                    messageItem.encryptedContentForReceiver ===
                      newMessage.encryptedContentForReceiver &&
                    messageItem.createdAt == newMessage.createdAt &&
                    messageItem.senderId == newMessage.senderId
                  ) {
                    return {
                      ...newMessage,
                      status: newMessageStatus,
                      decryptedContent: messageItem.decryptedContent,
                    };
                  }
                  return messageItem;
                }),
              ] as IConversationMessage[],
            };
          }
          return null;
        });
      }

      setConversationList((prevList: IConversation[]) => {
        const updatedList = prevList.map((conversationItem: IConversation) => {
          if (conversationItem.id === newMessage.conversationId) {
            return {
              ...conversationItem,
              messages: [
                ...conversationItem!.messages.map((messageItem) => {
                  if (messageItem.id === newMessage.id) {
                    return {
                      ...newMessage,
                      status: newMessageStatus,
                      decryptedContent: messageItem.decryptedContent,
                    };
                  } else if (
                    !messageItem.id &&
                    messageItem.encryptedContentForReceiver ===
                      newMessage.encryptedContentForReceiver &&
                    messageItem.createdAt == newMessage.createdAt &&
                    messageItem.senderId == newMessage.senderId
                  ) {
                    return {
                      ...newMessage,
                      status: newMessageStatus,
                      decryptedContent: messageItem.decryptedContent,
                    };
                  }
                  return messageItem;
                }),
              ] as IConversationMessage[],
            };
          }
          return conversationItem;
        });

        return updatedList;
      });
    },
    [conversationList.length, lastOpenConversationId, openConversation]
  );

  const emitMessageStatusToRead = useCallback(function (
    conversation: IConversation,
    userIdString: string
  ) {
    const socket = getSocket(userIdString);

    setConversationList((prevList: IConversation[]) => {
      const updatedList = prevList.map((conversationItem: IConversation) => {
        if (conversationItem.id === conversation.id) {
          // logger.log({ messages: conversationItem.messages });

          const newMessagesList = conversationItem.messages?.map(
            (messageItem) => {
              let newStatus = messageItem.status;
              // logger.log("Inside", { messageItem, userIdString });

              if (
                messageItem.senderId != userIdString &&
                (messageItem.status === MessageStatusEnum.DELIVERED ||
                  messageItem.status === MessageStatusEnum.SENT)
              ) {
                newStatus = MessageStatusEnum.READ;
                messageItem.status = newStatus;

                // logger.log("emitting status updates");
                socket.emit("statusUpdate", {
                  conversation,
                  message: messageItem,
                  newStatus,
                });
              }
              return {
                ...messageItem,
                status: newStatus,
              };
            }
          );
          return {
            ...conversationItem,
            messages: newMessagesList,
          };
        }
        return conversationItem;
      });

      return updatedList;
    });

    // conversation.messages?.forEach((messageItem) => {
    //   messageItem.status = MessageStatus.READ;
    // });
  },
  []);

  const handleOpenConversation = useCallback(
    function (conversation: IConversation) {
      if (!userIdString || conversation.id === lastOpenConversationId) {
        return;
      }

      const messageReceiver = conversation.participants.filter(
        (participantItem) => participantItem.userId != sessionUserProfile?.id
      );

      if (messageReceiver.length > 0) {
        setMessageReceiverUserProfile(messageReceiver[0].user);
      }

      emitMessageStatusToRead(conversation, userIdString);
      // TODO
      // conversation.messages.forEach((messageItem) => {
      //   if (messageItem.senderId == sessionUserProfile?.id) {
      //     messageItem.decryptedContent =
      //   }
      // })
      setOpenConversation(conversation);
      setLastOpenConversationId(conversation.id);

      logger.log("Open conversation", { conversation });
    },
    [
      userIdString,
      lastOpenConversationId,
      emitMessageStatusToRead,
      sessionUserProfile?.id,
    ]
  );

  async function handleSendMessage(conversation: IConversation) {
    if (
      !userIdString ||
      isLoading ||
      error ||
      !textContent ||
      !openConversation ||
      !messageReceiverUserProfile ||
      !messageReceiverUserProfile.publicKey ||
      !sessionUserProfile ||
      !sessionUserProfile.publicKey
    ) {
      logger.error("Unable to send messages", {
        userIdString,
        isLoading,
        error,
        textContent,
        openConversation,
        messageReceiverUserProfile,
        receiverPublicKey: messageReceiverUserProfile?.publicKey,
        sessionUserProfile,
        senderPublicKey: sessionUserProfile?.publicKey,
      });
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const encryptedContentForReceiver = await encryptMessage(
        messageReceiverUserProfile.publicKey,
        textContent
      );

      const encryptedContentForSender = await encryptMessage(
        sessionUserProfile.publicKey,
        textContent
      );

      const socket = getSocket(userIdString);

      const webSocketMessage = {
        conversationId: conversation.id,
        senderId: userIdString,
        encryptedContentForReceiver,
        encryptedContentForSender,
        sender: session?.user,
        conversation: {
          id: conversation.id,
        },
        createdAt: new Date().toISOString(),
      } as IConversationMessage;

      logger.log("Sending message over WebSockets:", webSocketMessage);
      socket.emit("sendMessage", webSocketMessage);

      setTextContent("");
      addNewMessageToConversationsState(webSocketMessage);
    } catch (error) {
      const errorString = `Send message error: ${error}`;
      setError(errorString);
      logger.error(errorString);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetryMessage(message: IConversationMessage) {
    if (!userIdString || !openConversation) return;

    const socket = getSocket(userIdString);
    logger.log("Retrying failed message:", message);

    const newMessage = { ...message, createdAt: new Date().toString() };

    socket.emit("sendMessage", newMessage);

    updateMessageStatus(newMessage, MessageStatusEnum.SENT);
  }

  useEffect(() => {
    async function fetchConversations() {
      if (isLoading || !userIdString || hasFetched || hasFetchedRef.current) {
        return;
      }

      try {
        hasFetchedRef.current = true;
        setHasFetched(true);
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations/user/${userIdString}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const conversationDataList = await response.json();

        if (messageReceiverUserId) {
          let hasFoundMessageReceiverConversation = false;

          if (conversationDataList.length) {
            hasFoundMessageReceiverConversation = conversationDataList.some(
              (conversationData) =>
                conversationData.participants.some((participantItem) => {
                  if (participantItem.userId === messageReceiverUserId) {
                    setMessageReceiverUserProfile(participantItem.user);
                    return true;
                  }
                  return false;
                })
            );
          }

          logger.log(
            `HAS FOUND MESSAGE RECEIVER CONVERSATION: ${hasFoundMessageReceiverConversation}`,
            {
              conversationDataList,
            }
          );

          if (!hasFoundMessageReceiverConversation) {
            const responseCreate = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversations`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  participants: [
                    { userId: userIdString },
                    { userId: messageReceiverUserId },
                  ],
                  messages: [],
                }),
              }
            );

            if (!responseCreate.ok) {
              throw new Error("Failed to create conversation");
            }

            const createdConversation = await responseCreate.json();

            logger.log("CREATED CONVERSATION:", { createdConversation });

            createdConversation.participants.some(
              (participantItem: IConversationParticipant) => {
                if (participantItem.user.id === messageReceiverUserId) {
                  setMessageReceiverUserProfile(participantItem.user);
                  return true;
                }
                return false;
              }
            );

            setConversationList([...conversationDataList, createdConversation]);
            handleOpenConversation(createdConversation);
          } else {
            setConversationList(conversationDataList);
          }
        } else {
          setConversationList(conversationDataList);
        }
      } catch (error) {
        const errorString = `Error fetching conversations for user ${userIdString}. Error: ${error}`;
        logger.error(errorString);
        setError(errorString);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [
    handleOpenConversation,
    hasFetched,
    isLoading,
    messageReceiverUserId,
    userIdString,
  ]);

  useEffect(() => {
    if (!userIdString) {
      return;
    }
    const socket = getSocket(userIdString);

    socket.on("connect", () => {
      logger.log("WebSocket connected:", socket.id);
    });

    socket.on("receiveMessage", (newMessage: IConversationMessage) => {
      logger.log("Received a new websocket message", { newMessage });
      // logger.log(
      //   newMessage.conversationId,
      //   lastOpenConversationId,
      //   newMessage.conversationId === lastOpenConversationId
      // );

      if (newMessage.conversationId === lastOpenConversationId) {
        newMessage.status = MessageStatusEnum.READ;

        socket.emit("statusUpdate", {
          conversation: openConversation,
          message: newMessage,
          newStatus: MessageStatusEnum.READ,
        });
      }
      addNewMessageToConversationsState(newMessage);
    });

    socket.on(
      "messageStatusUpdate",
      (response: {
        status: MessageStatusEnum;
        error: any;
        message: IConversationMessage;
      }) => {
        logger.log("New WebSocket message status update:", response);

        updateMessageStatus(response.message, response.status);
      }
    );

    socket.on("newMessageNotification", (message) => {
      logger.log(
        "New WebSocket message in conversation notification received:",
        { message }

        // TODO:
        // Add toast notification
      );
    });

    return () => {
      socket.off("receiveMessage"); // Clean up event listeners
      socket.off("messageStatusUpdate");
      socket.off("newMessageNotification");
      // Optionally, disconnect socket if no other components need it
      // socket.disconnect();
    };
  }, [
    userIdString,
    lastOpenConversationId,
    addNewMessageToConversationsState,
    updateMessageStatus,
    openConversation,
  ]);

  return (
    <div className={messagesStyles.container}>
      {contextMenu && (
        <div
          className={messagesStyles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              if (contextMenu.message) {
                handleRetryMessage(contextMenu.message);
              }
              setContextMenu(null);
            }}
          >
            Retry Sending
          </button>
        </div>
      )}

      <div className={messagesStyles.conversationList}>
        {isLoading ||
          (!conversationList.length && !hasFetched && (
            // <div className={messagesStyles.spinner}>
            //   {/* SVG Spinner */}
            //   <svg
            //     xmlns="http://www.w3.org/2000/svg"
            //     width="50"
            //     height="50"
            //     viewBox="0 0 50 50"
            //     className={messagesStyles.spinnerIcon}
            //   >
            //     <circle
            //       className={messagesStyles.spinnerPath}
            //       cx="25"
            //       cy="25"
            //       r="20"
            //       fill="none"
            //       strokeWidth="5"
            //     />
            //   </svg>
            // </div>
            <SkeletonTheme
              baseColor="var(--gray-alpha-100);"
              height={40}
              borderRadius={4}
            >
              <Skeleton count={3} style={{ marginBottom: "5px" }} />
            </SkeletonTheme>
          ))}
        {error && <p>{error}</p>}

        {!isLoading &&
          !error &&
          conversationList.map(
            (conversationData: IConversation, index: number) => (
              <div key={index}>
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
                      handleOpenConversation(conversationData);
                    }

                    return (
                      <div
                        className={`${messagesStyles.conversationItem} ${
                          openConversation?.participants.some(
                            (participantEntity) =>
                              participantEntity.userId ===
                              participantItem.userId
                          )
                            ? messagesStyles.selectedConversation
                            : ""
                        }`}
                        key={participantItem.id}
                        onClick={() => handleOpenConversation(conversationData)}
                      >
                        {participantItem.user.name}
                        {/* {logger.log({
                          lastOpenConversationId,
                          cid: conversationData.id,
                          id: openConversation?.id,
                        }) === undefined && <div></div>} */}
                        {lastOpenConversationId !== conversationData.id &&
                          countUnreadMessages(
                            conversationData.messages,
                            userIdString
                          ) > 0 && (
                            <div
                              className={messagesStyles.newMessageNotification}
                            />
                          )}
                      </div>
                    );
                  })}
              </div>
            )
          )}
      </div>

      <div className={messagesStyles.conversationMessagesContainer}>
        {openConversation && (
          <>
            <div
              ref={conversationMessagesRef}
              className={messagesStyles.conversationMessages}
            >
              {openConversation?.messages?.length
                ? openConversation.messages.map(
                    (message: IConversationMessage, index: number) => (
                      <div
                        key={index}
                        className={`${messagesStyles.messageContainerSlot} ${
                          message.senderId === userIdString
                            ? messagesStyles.messageContainerSlotSender
                            : messagesStyles.messageContainerSlotReceiver
                        }`}
                      >
                        <div
                          className={`${messagesStyles.messageContainer} ${
                            message.senderId === userIdString
                              ? messagesStyles.messageContainerSender
                              : messagesStyles.messageContainerReceiver
                          }`}
                          onContextMenu={(e) => {
                            if (
                              message.senderId === userIdString &&
                              message.status === MessageStatusEnum.FAILED
                            ) {
                              e.preventDefault();
                              // Get the bounding rectangle of the message container
                              const rect =
                                e.currentTarget.getBoundingClientRect();

                              setContextMenu({
                                x: e.pageX,
                                y: rect.top + CONTEXT_MENU_HEIGHT,
                                message: message,
                              });
                            }
                          }}
                        >
                          <div
                            className={messagesStyles.messageContent}
                            style={{
                              textAlign:
                                message.senderId === userIdString
                                  ? "right"
                                  : "unset",
                            }}
                          >
                            {message.decryptedContent}
                          </div>
                          <div className={messagesStyles.messageSender}>
                            <Image
                              className={messagesStyles.profileImage}
                              src={message.sender.image}
                              alt="Profile Image"
                              width={15}
                              height={15}
                              priority={true}
                            />
                            {message.sender.name}
                          </div>

                          <div className={messagesStyles.messageStatusDate}>
                            {`${formatDate(message.createdAt)}`}

                            {message.senderId === userIdString && (
                              <MessageStatus message={message} />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                : "Send your first message!"}
            </div>

            <div className={messagesStyles.messageTextInputContainer}>
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
