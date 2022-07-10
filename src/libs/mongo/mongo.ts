import { MongoClient, ServerApiVersion } from "mongodb";
import { uri } from "./mongo.config";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
};

const mongo = new MongoClient(uri, options);
const db = mongo.db("twofacedb");

const userCollection = db.collection("users");
const postCollection = db.collection("posts");
const likeCollection = db.collection("likes");
const commentCollection = db.collection("comments");
const messageCollection = db.collection("messages");
const chatCollection = db.collection("chats");
const friendsCollection = db.collection("friendships");

export {
  mongo,
  db,
  userCollection,
  postCollection,
  likeCollection,
  commentCollection,
  messageCollection,
  chatCollection,
  friendsCollection,
};
