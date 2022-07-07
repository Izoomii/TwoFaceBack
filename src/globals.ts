export const hexVerification = /[0-9A-Fa-f]{6}/g;

export interface Post {
  title: string;
  content: string;
  author_id: string;
  authorname: string;
  create_at: Date;
  updated_at: Date;
}

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  bio: string;
}

export interface UserCreationCredentials {
  email: string;
  firstname: string;
  password: string;
  repeatPassword: string;
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}
