import { FastifyInstance } from "fastify";

export class ApiKeyController {
  constructor(private readonly app: FastifyInstance) {}

  public bindRoutes() {
    const validAPI = "match-api-key";

    this.app.get("/login/apikey", async (req, res) => {
      const sentApiKey = req.headers["x-api-key"];
      if (!sentApiKey || sentApiKey !== validAPI) {
        res.status(403).send("Not authorized");
      }

      res.status(200).send("Authorized");
    });
  }
}
