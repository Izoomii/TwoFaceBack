export const frontUrl = "http://localhost:3000";
export const hexVerification = /[0-9A-Fa-f]{6}/g;

export const assetsDestination =
  "/home/izumi/Documents/Projects/Nodejs/TwoFace/twofacefront/public/assets";

export const userPicsDestination = assetsDestination + "/userpics";

export const objectIdVerify = (id: string): boolean => {
  if (id.length === 24 || hexVerification.test(id)) {
    return true;
  } else {
    return false;
  }
};

export interface Post {
  _id: string;
  title: string;
  content: string;
  author_id: string;
  authorname: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  profilepicture: string;
  backgroundpicture: string;
  bio: string;
}

export interface Chat {
  _id: string;
  image: string;
  chatname: string;
  participants: string[];
  created_at: Date;
}

export interface Message {
  _id: string;
  author_id: string;
  chat_id: string;
  content: string;
  created_at: Date;
}

export interface Like {
  _id: string;
  author_id: string;
  post_id: string;
  liked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  _id: string;
  author_id: string;
  parent_id: string;
  parenttype: "post" | "comment";
  content: string;
  created_at: Date;
  updated_at: Date;
}

// export enum CommentParentType {
//   POST,
//   COMMENT,
// }

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
