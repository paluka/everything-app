import { IConversationMessage, MessageStatusEnum } from "@/types/entities";

export const countUnreadMessages = (
  messages: IConversationMessage[],
  userId: string | undefined
): number => {
  if (!userId || !messages.length) {
    // logger.error(
    //   "No messages or userId in countUnreadMessages utility function"
    // );

    return -1;
  }

  const unreadCount = messages.filter(
    (message) =>
      message.status !== MessageStatusEnum.READ &&
      message.status !== MessageStatusEnum.FAILED &&
      message.senderId !== userId
  ).length;

  // logger.log({ unreadCount, messages });
  return unreadCount;
};
