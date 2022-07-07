import { Router } from "express";
import {
  User,
  UserCreationCredentials,
  UserLoginCredentials,
} from "../globals";
import { hash, verify } from "argon2";
import { db } from "../libs/mongo/mongo";

//give SessionData ability to have user
declare module "express-session" {
  export interface SessionData {
    user: User;
  }
}

const userCollection = db.collection("users"); //not sure about this

const userRouter = Router();

userRouter.get("/all", async (_, res) => {
  const result = await userCollection.find({}).toArray();
  res.json({ users: result });
});

userRouter.get("/whoami", async (req, res) => {
  res.json({ User: req.session.user });
});

userRouter.post("/create", async (req, res) => {
  const body = req.body as UserCreationCredentials;

  if (body.email === "" || body.firstname === "")
    return res.json({ message: "email or firstname empty", user: null });

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

export { userRouter };
