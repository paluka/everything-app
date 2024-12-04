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
}
