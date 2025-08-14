import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await connectDB();
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });

test("listar ruletas devuelve array", async () => {
  const res = await request(app).get("/api/roulettes").expect(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("no permite apostar si está cerrada (409)", async () => {
  const { body } = await request(app).post("/api/roulettes").expect(201);
  const id = body.id;
  await request(app)
    .post(`/api/roulettes/${id}/bets`)
    .send({ amount: 1000, color: "rojo" })
    .expect(409);
});

test("monto inválido (400)", async () => {
  const { body } = await request(app).post("/api/roulettes").expect(201);
  const id = body.id;
  await request(app).patch(`/api/roulettes/${id}/open`).expect(200);
  await request(app)
    .post(`/api/roulettes/${id}/bets`)
    .send({ amount: 20000, color: "rojo" }) // >10000
    .expect(400);
});

test("número fuera de rango (400)", async () => {
  const { body } = await request(app).post("/api/roulettes").expect(201);
  const id = body.id;
  await request(app).patch(`/api/roulettes/${id}/open`).expect(200);
  await request(app)
    .post(`/api/roulettes/${id}/bets`)
    .send({ amount: 100, number: 99 }) // 0..36
    .expect(400);
});

test("ruleta inexistente (404)", async () => {
  await request(app).patch(`/api/roulettes/000000000000000000000000/open`).expect(404);
});
