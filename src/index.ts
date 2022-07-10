import express from "express";
import session from "express-session";
import cors from "cors";
import { mongo } from "./libs/mongo/mongo";
import { postRouter } from "./modules/posts";
import { userRouter } from "./modules/users";
import { frontUrl, User } from "./globals";
import { chatRouter } from "./modules/chats";
import { friendsRouter } from "./modules/friendships";
const port = 8080;
const server = express();

//give SessionData ability to have user
declare module "express-session" {
  export interface SessionData {
    user: User;
  }
}

const corsParams = {
  origin: frontUrl,
  credentials: true,
};

server.use(cors(corsParams));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use(
  session({
    secret: "kitty with a lot of cookies",
    resave: false,
    saveUninitialized: false,
  })
);

mongo.connect((err) => {
  if (err) return console.log("Error Connecting to MongoDB:", err);
});

server.use("/posts", postRouter);
server.use("/users", userRouter);
server.use("/chats", chatRouter);
server.use("/friends", friendsRouter);

server.get("/test", async (req, res) => {
  res.json({ message: "Test Route!" });
});

// mongo.close()
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
