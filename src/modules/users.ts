import { Router } from "express";
import {
  User,
  UserCreationCredentials,
  UserLoginCredentials,
  userPicsDestination,
} from "../globals";
import { hash, verify } from "argon2";
import { userCollection } from "../libs/mongo/mongo";
import { uploadSingle } from "../libs/middleware/multer";
import { ObjectId } from "mongodb";

const userRouter = Router();

userRouter.get("/all", async (_, res) => {
  const result = await userCollection.find({}).toArray();
  res.json({ users: result });
});

userRouter.get("/user", async (req, res) => {
  const userId = req.query.user_id as string;
  //remove password from results, using mongodb projection or some shit
  const existingUser = await userCollection.findOne<User>({
    _id: new ObjectId(userId),
  });

  res.json({ user: existingUser });
});

userRouter.get("/whoami", async (req, res) => {
  res.json({ user: req.session.user ? req.session.user : null });
});

userRouter.post("/create", async (req, res) => {
  const body = req.body as UserCreationCredentials;

  if (body.email === "" || body.firstname === "")
    return res.json({ message: "Email or firstname empty", user: null });

  if (body.password === "")
    return res.json({ message: "Password is empty", user: null });

  const existingUser = await userCollection.findOne({
    email: body.email,
  });
  if (existingUser)
    return res.json({ message: "Email is already used.", user: null });

  if (body.password !== body.repeatPassword)
    return res.json({ message: "Passwords Don't match", user: null });

  const newUser = await userCollection.insertOne({
    firstname: body.firstname,
    email: body.email,
    password: await hash(body.password),
    lastname: "",
    bio: "",
    profilepicture: "",
    backgroundpicture: "",
  });
  res.json({ message: "Created user", user: newUser });
});

userRouter.post("/login", async (req, res) => {
  const body = req.body as UserLoginCredentials;

  //yey saved 2 nanoseconds by preventing a search for an empty email
  if (body.email === "") return res.json({ authorized: false, user: null });

  const existingUser = await userCollection.findOne<User>({
    email: body.email,
  });
  if (existingUser) {
    if (await verify(existingUser.password, body.password)) {
      req.session.user = existingUser;
      return res.json({ authorized: true, user: existingUser });
    }
  }
  res.json({ authorized: false, user: null });
});

userRouter.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json({ message: "There was an error", error: err });
    } else {
      res.json({ message: "Logged out.", error: null });
    }
  });
});

userRouter.post(
  "/update",
  uploadSingle("profilePicture", userPicsDestination),
  async (req, res) => {
    //assumes user is connected for now

    const body = req.body as User; //verify this before updating
    const user = req.session.user as User;
    const profilePicture = req.file ? req.file.filename : "";

    const updatedUser = await userCollection.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          firstname: body.firstname,
          email: body.email,
          // password: user.password, //doesnt change
          lastname: body.lastname,
          bio: body.bio,
          profilepicture: profilePicture ? profilePicture : user.profilepicture,
        },
      }
    );
    res.json({ message: "Updated user!", user: updatedUser });
  }
);

export { userRouter };
