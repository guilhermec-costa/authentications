import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../../secrets";
import { refreshTokenSchema } from "../schemas/refresh-token.schema";
import { UserService } from "../../application/user.service";
import { JWTService } from "../../application/jwt.service";
import { LoginRequestSchema } from "../schemas/login-request.schema";

/**
 *
 * JWT funciona por meio da geração de um token construído a partir de três componentes:
 * Header: (typ e algorithm para sign e verify)
 * Payload: (dados do usuário + issuer audience  + iat + expiresIn)
 * Secret: (segredo usado para assinar e verificar o token final)
 *
 * Pode ser usado tanto no processo de autenticação, quando em autorização.
 * E também pode ser usado para passagem de dados pela web
 */
export class JwtController {
  constructor(
    private readonly app: FastifyInstance,
    private readonly jwtService: JWTService,
    private readonly userService: UserService
  ) {}

  public bindRoutes() {
    this.app.post(
      "/login/jwtAuth",
      async (req: FastifyRequest, res: FastifyReply) => {
        const { body, ...rest } = req;

        const userData = LoginRequestSchema.parse(body);
        const { isAuthenticated, user } = await this.userService.authenticate(
          userData
        );
        if (!isAuthenticated || !user)
          throw new Error("User is not authenticated");

        // SHA256(b64(header) + "." + b64(payload) + "." + b64(secret))
        const authTokens = {
          accessToken: this.jwtService.genAccessToken({ userId: user._id }),
          refreshToken: this.jwtService.genRefreshToken({ userId: user._id }),
        };

        res.status(201).send(authTokens);
      }
    );

    this.app.post(
      "/refreshToken",
      async (req: FastifyRequest, res: FastifyReply) => {
        const { refreshToken } = refreshTokenSchema.parse(req.body);
      }
    );
  }
}
