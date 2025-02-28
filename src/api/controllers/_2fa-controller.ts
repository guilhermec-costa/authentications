import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { encode } from "hi-base32";
import OTPAuth, { TOTP } from "otpauth";
import QRCode from "qrcode";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";

export class _2FAController {
  constructor(private readonly app: FastifyInstance) {}

  public bindRoutes() {
    const fixedSecret = "KZ4C6SIRBZ6EYTDF";
    this.app.register(fastifyCookie, {
      secret: "akdbqorerqwhrqewfbwnbvwvwtguyhwgw",
    });
    this.app.register(fastifySession, {
      secret: "afgqqjrlqewrqrhbqwkçrbeqkwçrbq3reqwrjqwelrjqw",
      cookie: { secure: false, maxAge: 1000 * 60 * 15 },
    });

    this.app.post("/enable-2fa", async (req, res) => {
      // const base32Secret = new OTPAuth.Secret({ size: 20 }).base32;
      //@ts-ignore
      req.session.base32Secret = fixedSecret;

      // time-based one-time password
      let totp = new TOTP({
        issuer: "2fa Node Server Test",
        label: "2fa being tested",
        algorithm: "SHA1",
        digits: 6,
        secret: fixedSecret,
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
      const { token } = req.body as {} & { token: string };
      const totpVerifier = new TOTP({
        issuer: "2fa Node Server Test",
        label: "2fa being tested",
        algorithm: "SHA1",
        digits: 6,
        secret: fixedSecret,
      });

      const currentTime = Math.floor(Date.now() / 1000);
      const isTokenValid = totpVerifier.validate({
        token: token,
        window: 2,
        timestamp: currentTime,
      });

      console.log(isTokenValid);
      if (isTokenValid) {
        res.status(200).send("authorized");
      } else {
        res.status(403).send("Not authorized");
      }
    });
  }
}
