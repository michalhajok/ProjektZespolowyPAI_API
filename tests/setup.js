import mongoose from "mongoose";
process.env.JWT_SECRET = "change_me_in_prod";

import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;

envSetup();
async function envSetup() {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

export default app;
