export interface IPost {
  id: string;
  content: string;
  createdAt: string;
  user: IUserProfile;
  userId: string;
}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  image: string;

  posts: IPost[] | undefined;
  conversations: IConversationParticipant[] | undefined;
  messages: IConversationMessage[] | undefined;

  following: IFollow[];
  followers: IFollow[];

  followerCount: number;
  followingCount: number;
}

export interface IFollow {
  id: string;
  createdAt: string;
  following?: IUserProfile;
  follower?: IUserProfile;
}

export interface IConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  conversation: IConversation;
  user: IUserProfile;
  createdAt: string;
}

export enum MessageStatusEnum {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

export interface IConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatusEnum;
  conversation: IConversation;
  sender: IUserProfile;
  createdAt: string;
}

export interface IConversation {
  id: string;
  participants: IConversationParticipant[];
  messages: IConversationMessage[];
  createdAt: string;
}
