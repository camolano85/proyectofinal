import { Router } from "express";
import Roulette from "../models/Roulette.js";

const router = Router();

const isValidNumber = (n) => Number.isInteger(n) && n >= 0 && n <= 36;
const isValidColor  = (c) => ["rojo","negro","red","black"].includes(String(c).toLowerCase());
const colorByNumber = (n) => (n % 2 === 0 ? "rojo" : "negro");
const PAYOUTS = { number: 5.0, color: 1.8 };

// Crear ruleta
router.post("/", async (_req, res, next) => {
  try {
    const r = await Roulette.create({});
    res.status(201).json({ id: r.id });
  } catch (e) { next(e); }
});

// Listar ruletas
router.get("/", async (_req, res, next) => {
  try {
    const docs = await Roulette.find().lean();
    const out = docs.map(r => ({
      id: r._id.toString(),
      status: r.status,
      totalBets: r.bets?.length || 0,
      ...(r.status === "closed" && r.winningNumber != null
        ? { winningNumber: r.winningNumber, winningColor: r.winningColor }
        : {})
    }));
    res.json(out);
  } catch (e) { next(e); }
});

// Abrir ruleta
router.patch("/:id/open", async (req, res, next) => {
  try {
    const r = await Roulette.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Ruleta no encontrada" });
    if (r.status !== "open") {
      r.status = "open"; r.bets = [];
      r.winningNumber = undefined; r.winningColor = undefined; r.closedAt = undefined;
      await r.save();
    }
    res.json({ id: r.id, status: r.status });
  } catch (e) { next(e); }
});

// Apostar
router.post("/:id/bets", async (req, res, next) => {
  try {
    const r = await Roulette.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Ruleta no encontrada" });
    if (r.status !== "open") return res.status(409).json({ error: "La ruleta no está abierta" });

    const { amount, number, color } = req.body ?? {};
    if (typeof amount !== "number" || amount <= 0 || amount > 10000)
      return res.status(400).json({ error: "Monto inválido (1 .. 10000)" });

    const hasNumber = number != null, hasColor = color != null;
    if (hasNumber === hasColor)
      return res.status(400).json({ error: "Debe apostar a un número o a un color (no ambos)" });

    if (hasNumber) {
      if (!isValidNumber(number)) return res.status(400).json({ error: "Número inválido (0..36)" });
      r.bets.push({ type: "number", number, amount });
    } else {
      if (!isValidColor(color)) return res.status(400).json({ error: "Color inválido ('rojo' o 'negro')" });
      const normalized = String(color).toLowerCase().startsWith("r") ? "rojo" : "negro";
      r.bets.push({ type: "color", color: normalized, amount });
    }
    await r.save();
    res.status(201).json({ ok: true, bet: r.bets.at(-1) });
  } catch (e) { next(e); }
});

// Cerrar ruleta
router.patch("/:id/close", async (req, res, next) => {
  try {
    const r = await Roulette.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Ruleta no encontrada" });
    if (r.status !== "open") return res.status(409).json({ error: "La ruleta no está abierta" });

    const winningNumber = Math.floor(Math.random() * 37);
    const winningColor  = colorByNumber(winningNumber);

    const results = (r.bets || []).map(b => {
      let win=false, payout=0;
      if (b.type === "number" && b.number === winningNumber) { win=true; payout=+(b.amount*PAYOUTS.number).toFixed(2); }
      else if (b.type === "color" && b.color === winningColor) { win=true; payout=+(b.amount*PAYOUTS.color).toFixed(2); }
      return { ...b, result: win ? "WIN" : "LOSE", payout };
    });

    r.status = "closed";
    r.winningNumber = winningNumber;
    r.winningColor  = winningColor;
    r.closedAt = new Date();
    await r.save();

    res.json({ id: r.id, winningNumber, winningColor, results });
  } catch (e) { next(e); }
});

export default router;
