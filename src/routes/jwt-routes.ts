import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../secrets";
import { refreshTokenSchema, UserSchema } from "../schemas";
import { mapUsersResponse, users } from "../db-users";
import { genAccessToken, genRefreshToken } from "../jwt-utils";

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
  constructor(app: FastifyInstance) {
    app.post(
      "/login/jwtAuth",
      async (req: FastifyRequest, res: FastifyReply) => {
        const { body, ...rest } = req;

        const parsedBody = UserSchema.parse(body);
        const user = users.find((u) => u.username === parsedBody.username);
        if (!user) throw new Error("User not found");

        const passwordMatches = user.password === parsedBody.password;
        if (!passwordMatches) throw new Error("Password does not match");

        // SHA256(b64(header) + "." + b64(payload) + "." + b64(secret))
        const authTokens = {
          accessToken: genAccessToken({ userId: user.id }),
          refreshToken: genRefreshToken({ userId: user.id }),
        };

        res.status(201).send(authTokens);
      }
    );

    app.post(
      "/refreshToken",
      async (req: FastifyRequest, res: FastifyReply) => {
        const { refreshToken } = refreshTokenSchema.parse(req.body);
        try {
          const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {} & {
            userId: string;
          };

          const newTokens = {
            accessToken: genAccessToken({ userId: decoded.userId }),
            refreshToken: genRefreshToken({ userId: decoded.userId }),
          };

          return res.status(201).send(newTokens);
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send(error.message);
          }
        }
      }
    );

    app.get("/users", async (req: FastifyRequest, res: FastifyReply) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) return res.status(401).send({ data: "Not authorized" });

      try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        return res.status(200).send({ data: mapUsersResponse() });
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).send(error.message);
        }
      }
    });
  }
}
