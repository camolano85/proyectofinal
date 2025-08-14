import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import "dotenv/config";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test("flujo ruleta completo", async () => {
  const create = await request(app).post("/api/roulettes").expect(201);
  const id = create.body.id;

  await request(app).patch(`/api/roulettes/${id}/open`).expect(200);

  await request(app)
    .post(`/api/roulettes/${id}/bets`)
    .send({ amount: 1000, color: "rojo" })
    .expect(201);

  const close = await request(app).patch(`/api/roulettes/${id}/close`).expect(200);
  expect(close.body).toHaveProperty("winningNumber");
  expect(close.body).toHaveProperty("winningColor");
});
