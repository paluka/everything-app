import { IConversationMessage, MessageStatusEnum } from "@/types/entities";
import messageStatusStyles from "./messageStatus.module.scss";

function MessageStatus({ message }: { message: IConversationMessage }) {
  return (
    <div className={messageStatusStyles.messageStatus}>
      {message.status === MessageStatusEnum.FAILED && (
        <div className={messageStatusStyles.statusIcon} title="Failed to send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="red">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
      )}
      {message.status === MessageStatusEnum.SENT && (
        <div className={messageStatusStyles.statusIcon} title="Sent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#999">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      )}
      {message.status === MessageStatusEnum.DELIVERED && (
        <div className={messageStatusStyles.statusIcon} title="Delivered">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#999">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
          </svg>
        </div>
      )}
      {message.status === MessageStatusEnum.READ && (
        <div className={messageStatusStyles.statusIcon} title="Read">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default MessageStatus;
