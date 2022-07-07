import { MongoClient, ServerApiVersion } from "mongodb";
import { uri } from "./mongo.config";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
};

const mongo = new MongoClient(uri, options);
const db = mongo.db("twofacedb");

export { mongo, db };
