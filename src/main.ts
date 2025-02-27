import "dotenv/config";
import Fastify from "fastify";
import { JwtController } from "./api/controllers/jwt-controller";
import { OAuth2Controler } from "./api/controllers/oauth2-controller";
import { MongoDBClient } from "./mongoDbClient";
import { UserController } from "./api/controllers/user.controller";
import { UserService } from "./application/user.service";
import { MongoService } from "./application/mongo.service";
import { JWTService } from "./application/jwt.service";
import { OIDCController } from "./api/controllers/OIDC-controller";
import { KeycloakController } from "./api/controllers/keycloak-controller";

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

  const mongoService = new MongoService(mongoClient);
  const userService = new UserService(mongoService);
  const jwtService = new JWTService();

  const userController = new UserController(app, userService);
  const jwtController = new JwtController(app, jwtService, userService);
  const oauth2Controller = new OAuth2Controler(app);
  const oidcController = new OIDCController(app);
  const keycloakController = new KeycloakController(app);

  userController.bindRoutes();
  jwtController.bindRoutes();
  oauth2Controller.bindRoutes();
  oidcController.bindRoutes();
  keycloakController.bindRoutes();

  app.listen({ port: 3000 }).then(() => {
    console.log("Server listen on port 3000");
  });
})();
