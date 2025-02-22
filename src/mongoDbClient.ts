import { MongoClient } from "mongodb";

export class MongoDBClient {
  private static instance: MongoClient;

  private constructor() {}

  static get(): MongoClient {
    if (!this.instance) {
      this.instance = new MongoClient("mongodb://localhost:27017", {
        auth: {
          username: "root",
          password: "example",
        },
      });
    }

    return this.instance;
  }
}
