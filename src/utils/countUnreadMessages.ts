import { IConversationMessage, MessageStatus } from "@/types/entities";

export const countUnreadMessages = (
  messages: IConversationMessage[],
  userId: string | undefined
): number => {
  if (!userId || !messages.length) {
    // console.log(
    //   "No messages or userId in countUnreadMessages utility function"
    // );

    return -1;
  }

  const unreadCount = messages.filter(
    (message) =>
      message.status !== MessageStatus.READ &&
      message.status !== MessageStatus.FAILED &&
      message.senderId !== userId
  ).length;

  // console.log({ unreadCount, messages });
  return unreadCount;
};
