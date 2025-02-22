import "dotenv/config";
import Fastify from "fastify";
import { JwtController } from "./routes/jwt-routes";
import { OAuth2Controler } from "./routes/oauth2-routes";

const app = Fastify();

new JwtController(app);
new OAuth2Controler(app);

app.listen({ port: 3000 }).then(() => {
  console.log("Server listen on port 3000");
});
