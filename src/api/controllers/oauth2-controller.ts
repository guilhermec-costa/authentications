import { FastifyInstance } from "fastify";
import { google } from "googleapis";
// oauth2 roles
//  - Resource Owner: quem possui os dados que estão protegidos pelo Resource Server. O usuário.
//  - Client ( e.g aplicação de terceiros, meu frontend, meu backend ) que deseja acessar os dados protegidos pelo Resource Server
//  - Authorization Server ( e.g server do google ) autoriza o Client para acessar o Resource Server
//    1. endpoint pra gerar código de autorização
//    2. endpoint pra gerar access token a partir do código de autorização
//  - Resource Server: recebe requisições do client para acessar os dados, por meio do access token

// oauth2 flow
// Client chama Authorization Server pedindo autorização do Resource Owner para acessar os dados
// Authorization Server autentica o Resource Owner solicitante e verifica os escopos solicitados
// O Resource owner interage com o Authorization Server, para permitir ou negar acesso aos escopos
// Authorization server redireciona de volta para o Client, com um Authorization Code.
// Client chama o Authorization server passando o Authorization Code, para pegar um Access Token, e um Refresh Token (talvez)
// a partir daí, o Client faz requisições diretamente ao Resource Server, passando o Access Token, o qual valida a autorização dele.

// Configs made directly at the Resource Server
const GOOGLE_OAUTH_SCOPES = ["https://www.googleapis.com/auth/userinfo.email"];
const REDIRECT_URI = "http://localhost:3000/google/callback";

const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET_KEY,
  redirectUri: REDIRECT_URI,
});

export class OAuth2Controler {
  constructor(private readonly app: FastifyInstance) {}

  public bindRoutes() {
    // inicia o processo do oauth2
    this.app.get("/google/oauth2", async (req, res) => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GOOGLE_OAUTH_SCOPES,
        response_type: "code",
      });

      // direciona para Authorization Server para permissão do usuário
      res.redirect(authUrl);
    });

    // Após o usuário consentir, será redirecionado para cá
    this.app.get("/google/callback", async (req, res) => {
      const { code } = req.query as {} & { code: string };

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        res.send(tokens);
      } catch (error) {
        res.status(500).send("Failed to get google tokens");
      }
    });

    this.app.get("/getemailinfo", async (req, res) => {
      const clientInfo = await oauth2Client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });

      res.status(200).send(clientInfo.data);
    });
  }
}
