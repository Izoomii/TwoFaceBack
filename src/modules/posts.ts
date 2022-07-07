import { Router } from "express";
import { ObjectId } from "mongodb";
import { hexVerification, Post, User } from "../globals";
import { db } from "../libs/mongo/mongo";
const postRouter = Router();
const postCollection = db.collection("posts");
const userCollection = db.collection("users");

postRouter.get("/all", async (_, res) => {
  const elements = await postCollection.find({}).toArray();
  res.json({ data: elements });
});

postRouter.post("/create", async (req, res) => {
  const body = req.body as Post;
  //maybe send different response here
  if (body.title === "") return console.log("Title is empty in post creation");
  if (body.author_id.length !== 24 || !hexVerification.test(body.author_id))
    return console.log("Invalid author_id in post creation ");

  //verify user exists
  const existingUser = await userCollection.findOne<User>({
    _id: new ObjectId(body.author_id),
  });

  if (!existingUser) return console.log("User doesn't exist");
  const newPost = await postCollection.insertOne({
    title: body.title,
    content: body.content,
    author_id: body.author_id,
    authorname: existingUser?.firstname,
    created_at: new Date(),
    updated_at: new Date(),
  });
  res.json({ post: newPost });
});

export { postRouter };
