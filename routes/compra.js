import express from "express";
import { verificarToken } from "../controllers/verificarToken.js";

const router = express.Router();

router.get("/compra", verificarToken, (req, res) => {
    res.json({ mensaje: "Compra validada", usuario: req.user });
});

export default router;