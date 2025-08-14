import { Router } from "express";
import { rouletteService } from "../services/roulette.service.js";
const router = Router();

router.post("/", (req,res)=> res.status(201).json({ id: rouletteService.create() }));
router.get("/",  (req,res)=> res.json(rouletteService.list()));
router.patch("/:id/open", (req,res)=>{
  try { const r = rouletteService.open(req.params.id); res.json({ id:r.id, status:r.status }); }
  catch(e){ if(e.message==="NOT_FOUND") return res.status(404).json({error:"Ruleta no encontrada"}); res.status(400).json({error:"No se pudo abrir la ruleta"}); }
});
router.post("/:id/bets", (req,res)=>{
  try { const bet = rouletteService.placeBet(req.params.id, req.body); res.status(201).json({ ok:true, bet }); }
  catch(e){
    const map={NOT_FOUND:[404,"Ruleta no encontrada"],NOT_OPEN:[409,"La ruleta no está abierta"],INVALID_AMOUNT:[400,"Monto inválido (1 .. 10000)"],BET_TYPE_REQUIRED:[400,"Debe apostar a un número o a un color (no ambos)"],INVALID_NUMBER:[400,"Número inválido (0..36)"],INVALID_COLOR:[400,"Color inválido ('rojo' o 'negro')"]};
    const [code,msg]=map[e.message]??[400,"Solicitud inválida"]; res.status(code).json({error:msg});
  }
});
router.patch("/:id/close", (req,res)=>{
  try { res.json(rouletteService.close(req.params.id)); }
  catch(e){ const map={NOT_FOUND:[404,"Ruleta no encontrada"],NOT_OPEN:[409,"La ruleta no está abierta"]}; const [code,msg]=map[e.message]??[400,"Solicitud inválida"]; res.status(code).json({error:msg}); }
});

export default router;
