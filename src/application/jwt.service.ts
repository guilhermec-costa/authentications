import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../secrets";

export class JWTService {
  public refreshToken(refreshToken: string) {
    let userId: string = "";
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {} & {
        userId: string;
      };
      userId = decoded.userId;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error(error.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
    }

    const authTokens = {
      accessToken: this.genAccessToken({
        userId: userId,
      }),
      refreshToken: this.genRefreshToken({
        userId: userId,
      }),
    };

    return authTokens;
  }

  public genAccessToken(payload: object): string {
    const token = jwt.sign(payload, ACCESS_SECRET, {
      algorithm: "HS256",
      issuer: "server",
      audience: "client",
      expiresIn: "1m",
      header: { alg: "HS256", typ: "JWT" },
    });

    return token;
  }

  public genRefreshToken(payload: object): string {
    const token = jwt.sign(payload, REFRESH_SECRET, {
      algorithm: "HS256",
      issuer: "server",
      audience: "client",
      expiresIn: "7d",
      header: { alg: "HS256", typ: "JWT" },
    });

    return token;
  }
}
