import { Router } from "express";
import { ObjectId } from "mongodb";
import { Chat, Message, User } from "../globals";
import { isAuthentified } from "../libs/middleware/auth";
import { db } from "../libs/mongo/mongo";

const chatRouter = Router();

const userCollection = db.collection("users");
const chatCollection = db.collection("chats");
const messageCollection = db.collection("messages");

chatRouter.post("/create", isAuthentified, async (req, res) => {
  const body = req.body as Chat;
  //participants come as emails for now
  const participants: string[] = [];

  //verify body.participants array first
  //also check that elements are unique
  for (const email of body.participants) {
    const user = await userCollection.findOne<User>({
      email: email.trim(),
    });
    //note that this will just ignore invalid emails
    if (!user) continue;
    participants.push(user._id.toString());
  }

  const newChat = await chatCollection.insertOne({
    image: "", //IMPL to have image from body.image
    chatname: body.chatname,
    created_at: new Date(),
    participants: participants,
  });
  res.json({ message: "Created new chat!", chat: newChat });
});

chatRouter.get("/list", isAuthentified, async (req, res) => {
  const user = req.session.user as User;
  const chatList = await chatCollection
    .find({
      participants: { $all: [user._id] },
    })
    .toArray();
  res.json({ chatList: chatList });
});

chatRouter.get("/log", isAuthentified, async (req, res) => {
  const chatId = req.query.id as string;
  const user = req.session.user as User;
  const existingChat = await chatCollection.findOne<Chat>({
    _id: new ObjectId(chatId), //do the hex verification thing
  });
  if (existingChat) {
    let userIsParticipant = false;
    for (const element of existingChat.participants) {
      if (user._id === element) {
        userIsParticipant = true;
        break;
      }
    }
    if (userIsParticipant) {
      const messages = await messageCollection
        .find({
          author_id: user._id,
          chat_id: chatId,
        })
        .toArray();
      return res.json(messages);
    }
  }
  res.json({ message: "There was an error retrieving the chat" }); //improve this
});

chatRouter.post("/messages/create", isAuthentified, async (req, res) => {
  const body = req.body as Message;
  const user = req.session.user as User;
  //do verification on the message body

  if (body.content === "")
    return res.json({ message: "Message Content cannot be empty" });

  const newMessage = await messageCollection.insertOne({
    chat_id: body.chat_id,
    content: body.content,
    author_id: user._id,
    created_at: new Date(),
  });
  res.json({ message: "Sent message!", response: newMessage });
});

export { chatRouter };
