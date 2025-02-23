import { FastifyInstance } from "fastify";
import { UserService } from "../../application/user.service";
import { RegisterUserSchema } from "../schemas/register-user-request.schema";

export class UserController {
  constructor(
    private readonly app: FastifyInstance,
    private readonly userService: UserService
  ) {}

  public bindRoutes() {
    this.app.post("/user/register", async (req, res) => {
      const userData = RegisterUserSchema.parse(req.body);
      await this.userService.register(userData);
    });

    this.app.get("/user/list", async (req, res) => {
      return await this.userService.list();
    });
  }
}
