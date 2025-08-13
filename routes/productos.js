
import { Router } from "express"; 
import Productos from "../classes/Productos.js"; // Clase para gestionar productos

// Crear instancia del router
const router = Router();

// Crear instancia de la clase Productos
const productos = new Productos();

// Conectar a la base de datos (se ejecuta al cargar el módulo)
await productos.conectar(); // Establece conexión con la fuente de datos

// Obtener la lista completa de productos
const listaProductos = await productos.listar(); // Recupera todos los productos disponibles

// Ruta GET principal para devolver la lista de productos
router.get('/', (req, res) =>
    res.send(listaProductos) // Enviar la lista como respuesta al cliente
);

// Exportar el router para usarlo en la aplicación principal
export default router;