import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/roulettes.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/roulettes", router);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ error: "Not found" }));

export default app;

