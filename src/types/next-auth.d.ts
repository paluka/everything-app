// export interface ISession {
//   user: {
//     name: string;
//     email: string;
//     image?: string;
//     id?: string;
//   };
//   expires: string;
//   id?: string;
// }

// export interface IToken {
//   sub: string;
//   name?: string;
//   email?: string;
//   id?: string;
// }

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string; // Custom property
      name?: string;
      email?: string;
      image?: string;
    };
    expires: string;
  }

  //   interface Token {
  //     id?: string; // Custom property
  //   }

  interface User {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    posts?: Post[];
  }
}
