import { Router } from "express";
import { ObjectId } from "mongodb";
import { hexVerification, Post, User } from "../globals";
import { isAuthentified } from "../libs/middleware/auth";
import { db } from "../libs/mongo/mongo";
const postRouter = Router();
const postCollection = db.collection("posts");

postRouter.get("/all", async (_, res) => {
  const elements = await postCollection.find({}).toArray();
  res.json({ data: elements });
});

postRouter.post("/create", isAuthentified, async (req, res) => {
  const body = req.body as Post;
  const user = req.session.user as User;

  if (body.title === "")
    return res.json({ message: "Title is empty in post creation", post: null });

  //why do i still have this? only god knows
  //god KNEW, i needed this later
  if (user._id.length !== 24 || !hexVerification.test(user._id))
    return console.log("Invalid author_id in post creation ");

  const newPost = await postCollection.insertOne({
    title: body.title,
    content: body.content,
    author_id: user._id,
    authorname: user.firstname,
    created_at: new Date(),
    updated_at: new Date(),
  });
  res.json({ message: "Created new post!", post: newPost });
});

//interactions: (likes, comments, etc...)

export { postRouter };
