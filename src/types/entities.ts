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

  //   id: string | undefined;
  //   name: string | undefined;
  //   email: string | undefined;
  //   image: string | undefined;
  posts?: IPost[] | undefined;
  conversations?: IConversationParticipants[] | undefined;
  messages?: IConversationMessage[] | undefined;
}

export interface IConversationParticipants {
  id: string;
  conversationId: string;
  userId: string;
  conversation: IConversation;
  user: IUserProfile;
  createdAt: string;
}

export interface IConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  conversation: IConversation;
  sender: IUserProfile;
  createdAt: string;
}

export interface IConversation {
  id: string;
  participants: IConversationParticipants[];
  messages: IConversationMessage[];
  createdAt: string;
}
