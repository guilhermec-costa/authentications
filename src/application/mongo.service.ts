import { Document, MongoClient } from "mongodb";
import { MongoDBClient } from "../mongoDbClient";

export class MongoService {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private getDb(db: string) {
    return this.mongoClient.db(db);
  }

  public getCollection<T extends Document>(collection: string) {
    const rootDB = this.getDb("authentication");
    return rootDB.collection<T>(collection);
  }
}
