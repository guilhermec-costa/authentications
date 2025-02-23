import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../secrets";

export class JWTService {
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
