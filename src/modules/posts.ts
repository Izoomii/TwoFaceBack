import { Router } from "express";
import { ObjectId } from "mongodb";
import { hexVerification, Like, Post, User, Comment } from "../globals";
import { isAuthentified } from "../libs/middleware/auth";
import {
  postCollection,
  likeCollection,
  commentCollection,
} from "../libs/mongo/mongo";
const postRouter = Router();

postRouter.get("/all", async (_, res) => {
  const elements = await postCollection
    .find({})
    .sort({ created_at: -1 })
    .toArray();
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

postRouter.get("/likes", isAuthentified, async (req, res) => {
  const postId = req.query.post_id as string;
  const existingPost = await postCollection.findOne({
    _id: new ObjectId(postId),
  });
  if (!existingPost) return res.json({ message: "Post doesn't exist" });
  const postLikes = await likeCollection
    .find({
      post_id: postId,
      liked: true,
    })
    .toArray();
  res.json({ message: "Searched all likes for the post", response: postLikes });
});

postRouter.get("/likesamount", isAuthentified, async (req, res) => {
  const postId = req.query.post_id as string;

  //use aaggregation instead
  const likesAmount = await likeCollection
    .find({
      post_id: postId,
      liked: true,
    })
    .toArray();
  res.json({ amount: likesAmount.length });
});

postRouter.post("/like", isAuthentified, async (req, res) => {
  const body = req.body as { post_id: string };
  const user = req.session.user as User;
  const existingPost = await postCollection.findOne({
    _id: new ObjectId(body.post_id),
  });

  if (!existingPost) return res.json({ message: "Post doesn't exist" });

  const existingLike = await likeCollection.findOne<Like>({
    author_id: user._id,
    post_id: body.post_id,
  });

  if (existingLike) {
    const updatedLike = await likeCollection.updateOne(
      {
        _id: new ObjectId(existingLike._id),
      },
      {
        $set: {
          liked: !existingLike.liked,
          updated_at: new Date(),
        },
      }
    );
    res.json({ message: "Updated Like", response: updatedLike });
  } else {
    const newLike = await likeCollection.insertOne({
      author_id: user._id,
      post_id: body.post_id,
      liked: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.json({ message: "Created new Like", response: newLike });
  }
});

postRouter.get("/comments", async (req, res) => {
  const query = req.query as { parent_id: string; parenttype: string }; //move this to globals if it's needed in multiple other requests
  //this will assume parenttype is post when nothing is specified
  //it doesn't work -__-
  const existingParent =
    query.parenttype === "comment"
      ? await commentCollection.findOne({ _id: new ObjectId(query.parent_id) })
      : await postCollection.findOne({ _id: new ObjectId(query.parent_id) });

  if (!existingParent)
    return res.json({
      message: `${query.parenttype} doesn't exist`,
      response: null,
    });

  //return list of comments here instead
  const commentsList = await commentCollection
    .find({
      parent_id: query.parent_id,
      parenttype: query.parenttype,
    })
    .toArray();
  res.json({ message: "Found comments", response: commentsList });
});

postRouter.post("/comment", isAuthentified, async (req, res) => {
  const body = req.body as Comment;
  const user = req.session.user as User;

  const existingParent =
    body.parenttype === "post"
      ? await postCollection.findOne({ _id: new ObjectId(body.parent_id) })
      : await commentCollection.findOne({ _id: new ObjectId(body.parent_id) });

  if (!existingParent)
    return res.json({
      message: `${body.parenttype} doesn't exist`,
      response: null,
    });

  const newComment = await commentCollection.insertOne({
    author_id: user._id,
    parent_id: body.parent_id,
    parenttype: body.parenttype,
    content: body.content,
    created_at: new Date(),
    updated_at: new Date(),
  });

  res.json({ message: "Created new comment!", response: newComment });
});

export { postRouter };
