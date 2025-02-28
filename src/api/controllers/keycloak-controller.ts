import { FastifyInstance } from "fastify";
import keycloak, { KeycloakOptions } from "fastify-keycloak-adapter";

export class KeycloakController {
  constructor(private readonly app: FastifyInstance) {
    const kcConfig: KeycloakOptions = {
      clientId: "myclient",
      logoutEndpoint: "/logout",
      appOrigin: "http://localhost:8080/realms/authtest",
      keycloakSubdomain: "localhost",
      clientSecret: "Tg8swZdEq9MISekWTrJLmNwUE950c6ry",
      disableCookiePlugin: true,
      disableSessionPlugin: true,
    };

    // this.app.register(keycloak, kcConfig);
  }

  public bindRoutes() {
    this.app.get("/keycloak", async (req, res) => {
      res.status(200).send("auth");
    });
  }
}
