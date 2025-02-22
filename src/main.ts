import "dotenv/config";
import Fastify from "fastify";
import { JwtController } from "./routes/jwt-routes";
import { OAuth2Controler } from "./routes/oauth2-routes";
import { MFAController } from "./routes/mfa.routes";
import { MongoClient } from "mongodb";
import { MongoDBClient } from "./mongoDbClient";
import { UserController } from "./routes/user.routes";

(async function main() {
  const app = Fastify();
  const mongoClient = MongoDBClient.get();
  mongoClient
    .connect()
    .then(() => {
      console.log("Connected to mongoDB");
    })
    .catch((e) => {
      console.error("Failed to connect to mongoDB: ", e);
    });

  new UserController(app);
  new JwtController(app);
  new OAuth2Controler(app);
  new MFAController(app);

  app.listen({ port: 3000 }).then(() => {
    console.log("Server listen on port 3000");
  });
})();
