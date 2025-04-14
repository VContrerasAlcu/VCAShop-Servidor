import { Router } from "express";
import Productos from "../classes/Productos.js";

const router = Router();

const productos = new Productos();
await productos.conectar();
const listaProductos = await productos.listar();
router.get('/',(req,res) =>
            res.response(listaProductos)
        );

export default router;