export interface IPost {
  id: string;
  content: string;
  createdAt: string;
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
}
