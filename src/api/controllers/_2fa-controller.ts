import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { encode } from "hi-base32";
import { TOTP } from "otpauth";
import QRCode from "qrcode";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";

export class _2FAController {
  constructor(private readonly app: FastifyInstance) {}

  public bindRoutes() {
    this.app.register(fastifyCookie, {
      secret: "akdbqorerqwhrqewfbwnbvwvwtguyhwgw",
    });
    this.app.register(fastifySession, {
      secret: "afgqqjrlqewrqrhbqwkçrbeqkwçrbq3reqwrjqwelrjqw",
      cookie: { secure: false },
    });

    this.app.post("/enable-2fa", async (req, res) => {
      const base32Secret = this.generateSecret();
      //@ts-ignore
      req.session.base32Secret = base32Secret;

      //@ts-ignore
      console.log("secret on enable: " + req.session.base32Secret);

      // time-based one-time password
      let totp = new TOTP({
        issuer: "2fa Node Server Test",
        label: "2fa being tested",
        algorithm: "SHA1",
        digits: 6,
        secret: base32Secret,
      });

      let otpauth_url = totp.toString();

      try {
        const qrcode = await QRCode.toDataURL(otpauth_url);
        res.type("text/html").send(`<img src="${qrcode}" />`);
      } catch (error) {
        res.status(500).send("Failed to generate qrcode");
      }
    });

    this.app.post("/verify-2fa", async (req, res) => {
      console.log(req.session.sessionId);
      //@ts-ignore
      const sessionSecret = req.session.base32Secret;

      //@ts-ignore
      console.log("secret on verify: " + req.session.base32Secret);

      const { token } = req.body as {} & { token: string };
      console.log("Sent token: ", token);
      const totpVerifier = new TOTP({
        issuer: "2fa Node Server Test",
        label: "2fa being tested",
        algorithm: "SHA1",
        digits: 6,
        secret: sessionSecret,
      });

      const isTokenValid = totpVerifier.validate({ token, window: 2 });
      if (isTokenValid) {
        res.status(200).send("authorized");
      } else {
        res.status(403).send("Not authorized");
      }
    });
  }

  private generateSecret() {
    const buf = crypto.randomBytes(15);
    const encBuf = encode(buf).replace(/=/g, "").substring(0, 24);
    return encBuf;
  }
}
