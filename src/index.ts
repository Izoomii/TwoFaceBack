import express from "express";
import session from "express-session";
import { mongo } from "./libs/mongo/mongo";
import { postRouter } from "./modules/posts";
import { userRouter } from "./modules/users";
const port = 8080;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

mongo.connect((err) => {
  if (err) return console.log("Error Connecting to MongoDB:", err);
});
server.use(
  session({
    secret: "kitty with a lot of cookies",
    resave: false,
    saveUninitialized: false,
  })
);

server.use("/posts", postRouter);
server.use("/users", userRouter);

// mongo.close()
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
