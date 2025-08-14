import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/roulettes.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/roulettes", router);
app.use((req,res)=>res.status(404).json({error:"Not found"}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`API on http://localhost:${PORT}`));
