import { FastifyInstance } from "fastify";
import { MongoDBClient } from "../mongoDbClient";
import { UserSchema } from "../schemas";
import bcrypt from "bcrypt";

export class UserController {
  constructor(app: FastifyInstance) {
    const mongoClient = MongoDBClient.get();
    const rootDB = mongoClient.db("authentication");
    const userCollection = rootDB.collection("users");

    app.post("/user/register", async (req, res) => {
      const userData = UserSchema.parse(req.body);
      const pwdHash = await bcrypt.hash(userData.password, 10);
      await userCollection.insertOne({
        username: userData.username,
        password: pwdHash,
      });
    });

    app.get("/user/list", async (req, res) => {
      return await userCollection.find({}).toArray();
    });
  }
}
