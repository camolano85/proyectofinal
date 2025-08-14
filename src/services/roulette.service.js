import { nanoid } from "nanoid";

const DB = { roulettes: new Map() };
const isValidNumber = n => Number.isInteger(n) && n >= 0 && n <= 36;
const isValidColor  = c => ["rojo","negro","red","black"].includes(String(c).toLowerCase());
const colorByNumber = n => (n % 2 === 0 ? "rojo" : "negro");
const PAYOUTS = { number: 5.0, color: 1.8 };

export const rouletteService = {
  create() {
    const id = nanoid(8);
    DB.roulettes.set(id, { id, status: "closed", bets: [] });
    return id;
  },
  list() {
    return Array.from(DB.roulettes.values()).map(r => ({
      id: r.id, status: r.status, totalBets: r.bets.length,
      ...(r.status === "closed" && r.winningNumber != null
        ? { winningNumber: r.winningNumber, winningColor: r.winningColor }
        : {})
    }));
  },
  open(id) {
    const r = DB.roulettes.get(id);
    if (!r) throw new Error("NOT_FOUND");
    if (r.status === "open") return r;
    r.status = "open"; r.bets = [];
    delete r.winningNumber; delete r.winningColor; delete r.closedAt;
    return r;
  },
  placeBet(id, payload) {
    const r = DB.roulettes.get(id);
    if (!r) throw new Error("NOT_FOUND");
    if (r.status !== "open") throw new Error("NOT_OPEN");
    const { amount, number, color } = payload ?? {};
    if (typeof amount !== "number" || amount <= 0 || amount > 10000) throw new Error("INVALID_AMOUNT");
    const hasNumber = number != null, hasColor = color != null;
    if (hasNumber === hasColor) throw new Error("BET_TYPE_REQUIRED");
    if (hasNumber) {
      if (!isValidNumber(number)) throw new Error("INVALID_NUMBER");
      r.bets.push({ type:"number", number, amount }); return { type:"number", number, amount };
    } else {
      if (!isValidColor(color)) throw new Error("INVALID_COLOR");
      const normalized = String(color).toLowerCase().startsWith("r") ? "rojo" : "negro";
      r.bets.push({ type:"color", color: normalized, amount }); return { type:"color", color: normalized, amount };
    }
  },
  close(id) {
    const r = DB.roulettes.get(id);
    if (!r) throw new Error("NOT_FOUND");
    if (r.status !== "open") throw new Error("NOT_OPEN");
    const winningNumber = Math.floor(Math.random() * 37);
    const winningColor  = colorByNumber(winningNumber);
    const results = r.bets.map(b => {
      let win=false, payout=0;
      if (b.type==="number" && b.number===winningNumber) { win=true; payout=+(b.amount*PAYOUTS.number).toFixed(2); }
      else if (b.type==="color" && b.color===winningColor) { win=true; payout=+(b.amount*PAYOUTS.color).toFixed(2); }
      return { ...b, result: win ? "WIN" : "LOSE", payout };
    });
    r.status="closed"; r.winningNumber=winningNumber; r.winningColor=winningColor; r.closedAt=new Date().toISOString();
    return { id:r.id, winningNumber, winningColor, results };
  }
};
