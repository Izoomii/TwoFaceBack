import { Router } from "express";
import { ObjectId } from "mongodb";
import { Friendship, User } from "../globals";
import { isAuthentified } from "../libs/middleware/auth";
import { friendsCollection } from "../libs/mongo/mongo";

const friendsRouter = Router();

friendsRouter.get("/all", isAuthentified, async (req, res) => {
  const status = req.query.status as string;
  const user = req.session.user as User;
  if (!(status == "accepted" || status == "declined" || status == "pending"))
    return res.json({ message: "Invalid query" });
  const result = await friendsCollection
    .find({
      $or: [
        { sender_id: user._id.toString() },
        { receiver_id: user._id.toString() },
      ],
      status,
    })
    .toArray();
  res.json(result);
});

friendsRouter.get("/friendship", isAuthentified, async (req, res) => {
  const user = req.session.user as User;
  const receiverId = req.query.user_id as string;

  const existingFriendship = await friendsCollection.findOne<Friendship>({
    $or: [
      { sender_id: user._id, receiver_id: receiverId },
      { sender_id: receiverId, receiver_id: user._id },
    ],
  });

  if (!existingFriendship)
    return res.json({
      message: "There isn't any friendship between you.",
      friendship: null,
    });
  res.json({ message: "Found friendship", friendship: existingFriendship });
});

friendsRouter.post("/send", isAuthentified, async (req, res) => {
  const body = req.body as { receiver_id: string };
  const user = req.session.user as User;

  if (body.receiver_id === user._id)
    return res.json({
      message:
        "You can't send yourself a friend request, you're already friends.",
    });

  const existingRequests = await friendsCollection
    .find<Friendship>({
      $or: [
        { sender_id: user._id, receiver_id: body.receiver_id },
        { sender_id: body.receiver_id, receiver_id: user._id },
      ],
    })
    .toArray();
  //unlikely to exist but still
  if (existingRequests.length > 1)
    return res.json({ message: "Error, Duplicate requests" });

  if (existingRequests[0]) {
    const request = existingRequests[0];

    if (request.status === "accepted")
      return res.json({ message: "You are already friends!" });

    if (request.status === "pending") {
      if (request.sender_id === user._id)
        return res.json({ message: "Your request is still pending." });

      const updatedRequest = await friendsCollection.updateOne(
        {
          _id: new ObjectId(request._id),
        },
        { $set: { status: "accepted", updated_at: new Date() } }
      );
      res.json({
        message: "Accepted pending request!",
        response: updatedRequest,
      });
    } else {
      const updatedRequest = await friendsCollection.updateOne(
        {
          _id: new ObjectId(request._id),
        },
        {
          $set: {
            sender_id: user._id,
            receiver_id: body.receiver_id,
            status: "pending",
            updated_at: new Date(),
          },
        }
      );
      res.json({
        message: "Renewed declined Request",
        response: updatedRequest,
      });
    }
  } else {
    const newRequest = await friendsCollection.insertOne({
      sender_id: user._id,
      receiver_id: body.receiver_id,
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.json({ message: "Sent request!", response: newRequest });
  }
});

friendsRouter.post("/decline", isAuthentified, async (req, res) => {
  const body = req.body as { receiver_id: string };
  const user = req.session.user as User;

  const existingRequest = await friendsCollection.findOne<Friendship>({
    $or: [
      { sender_id: user._id, receiver_id: body.receiver_id },
      { sender_id: body.receiver_id, receiver_id: user._id },
    ],
  });

  if (body.receiver_id === user._id)
    return res.json({ message: "Hey! You can't decline yourself!" });

  if (!existingRequest)
    return res.json({
      message: "The user you're trying to decline doesn't exist, calm down!",
    });

  if (existingRequest.status === "declined")
    return res.json({ message: "Request is already declined" });

  const updatedRequest = await friendsCollection.updateOne(
    { _id: new ObjectId(existingRequest._id) },
    {
      $set: {
        status: "declined",
        updated_at: new Date(),
      },
    }
  );
  //not important but user who sent request could cancel it, maybe change the message to "cancelled" in that condition
  res.json({ message: "Declined.", response: updatedRequest });
});

export { friendsRouter };
