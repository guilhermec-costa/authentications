import { Collection, ObjectId, OptionalId } from "mongodb";
import { LoginRequest } from "../api/schemas/login-request.schema";
import { MongoService } from "./mongo.service";
import bcrypt from "bcrypt";
import { User } from "../api/schemas/user-dto.schema";
import { RegisterUserRequest } from "../api/schemas/register-user-request.schema";

export class UserService {
  private readonly userCollection: Collection<User>;
  constructor(private readonly mongoService: MongoService) {
    this.userCollection = this.mongoService.getCollection("users");
  }

  public async authenticate(
    checkUser: LoginRequest
  ): Promise<{ isAuthenticated: boolean; user: User | undefined }> {
    const users = await this.list();
    const user = users.find((u) => u.username === checkUser.username);
    if (!user) return { isAuthenticated: false, user: undefined };

    const passwordMatches = user.password === checkUser.password;
    if (!passwordMatches) return { isAuthenticated: false, user: undefined };

    return { isAuthenticated: true, user };
  }

  public async list(): Promise<User[]> {
    const users = await this.userCollection.find({}).toArray();
    return users;
  }

  public async findByName(username: string): Promise<User | null> {
    const user = await this.userCollection.findOne({ username });
    return user;
  }

  public async register(user: RegisterUserRequest) {
    const pwdHash = await bcrypt.hash(user.password, 10);
    await this.userCollection.insertOne({
      username: user.username,
      password: pwdHash,
    });
  }
}
