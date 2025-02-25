/**
 OIDC (open id connect): protocolo de autenticação que utiliza oauth2 por debaixo
 camada de autenticação por cima da camada de autorização do oauth2

 verifica a identidade de um usuário para um serviço client (PARTE CONFIÁVEL (RP), e.g app web)
 idP: identity provider / provedor de OIDC: realiza a AUTENTICAÇÃO e consentimento do usuário, e gera o token

 componentes:
  token de id: informações do resultado da autenticação, como as infos do usuário
  access token: para validação de autorização interna ou a consultas de apis
  refresh token

  idp pode usar alguns fatores como autenticação:
  Nome de usuário/senha
  Código de uso único entregue fora da banda, por exemplo, por SMS ou e-mail
  Código gerado pelo aplicativo (OATH, TOTP ou HOTP)
  Biométrico por meio do aplicativo
  Federado (por exemplo, Facebook, GoogleID)
*/

import { FastifyInstance } from "fastify";
import * as client from "openid-client";
import jwt from "jsonwebtoken";

const REDIRECT_URI = "http://localhost:3000/google/callback";

export class OIDCController {
  private config!: client.Configuration;
  constructor(private readonly app: FastifyInstance) {
    client
      .discovery(
        new URL("https://accounts.google.com"),
        process.env.CLIENT_ID || "",
        { client_secret: process.env.CLIENT_SECRET_KEY }
      )
      .then((c) => {
        this.config = c;
      });
  }

  public bindRoutes() {
    let codeVerifier: string = "";
    this.app.get("/google/openid/login", async (req, res) => {
      codeVerifier = client.randomPKCECodeVerifier();
      let codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
      let parameters: Record<string, string> = {
        redirect_uri: "http://localhost:3000/google/openid/callback",
        scope: "openid profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      };

      let redirectTo = client.buildAuthorizationUrl(this.config, parameters);
      res.redirect(redirectTo.toString());
    });

    this.app.get("/google/openid/callback", async (req, res) => {
      try {
        const { code } = req.query as { code?: string };
        const url = "http://localhost:3000" + req.url;

        console.log("Authorization code: ", code);
        console.log("�🔑 Code Verifier: ", codeVerifier);

        if (!code) {
          return res.status(400).send("Missing authorization code");
        }

        const tokens = await client.authorizationCodeGrant(
          this.config,
          new URL(url),
          {
            pkceCodeVerifier: codeVerifier,
          }
        );

        res.status(200).send({ tokens });
      } catch (error) {
        console.error("Erro ao trocar código por token:", error);
        res.status(500).send("Erro ao autenticar.");
      }
    });

    this.app.get("/google/openid/userinfo", async (req, res) => {
      const auth = req.headers.authorization;

      try {
        const userInfo = jwt.decode(auth || "");
        res.status(200).send({ data: userInfo });
      } catch (error) {
        res.status(400).send({ error: error });
      }
    });
  }
}
