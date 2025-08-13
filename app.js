// Importación de módulos
import express from 'express'; // Framework para crear el servidor HTTP
import rutaProductos from './routes/productos.js'; // Ruta para productos
import rutaLogin from './routes/login.js'; // Ruta para login
import rutaClientes from './routes/clientes.js'; // Ruta para gestión de clientes
import rutaCarros from './routes/carros.js'; // Ruta para carritos
import rutaPago from "./routes/pago.js"; // Ruta para pagos con Redsys
import cors from 'cors'; // Middleware para permitir peticiones entre dominios
import path from 'path'; // Módulo para gestionar rutas de archivos
import http from 'http'; // Módulo nativo para crear servidor HTTP
import { Server } from 'socket.io'; // Librería para WebSockets
import { socketCarro } from './sockets/socketsCarros.js'; // Módulo de eventos de carrito vía WebSocket
import { eliminarCarrosAntiguos } from './servicios/LimpiezaCarros.js'; // Servicio para limpiar carritos abandonados
import cron from 'node-cron'; // Librería para tareas programadas
import dotenv from 'dotenv'; // Cargar variables de entorno desde .env

dotenv.config(); // Inicializar dotenv

// Lista de clientes conectados (no usada directamente aquí)
const listaClientes = {};

// Inicialización de Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO con CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Permitir peticiones desde el frontend
        methods: ['GET', 'POST']
    }
});

// Evento de conexión de cliente vía WebSocket
io.on('connection', (socket) => {
    console.log('Conexion de cliente efectuada');

    // Asociar el socket a una "sala" con el email del cliente
    socket.on('registro', (email) => {
        socket.join(email);
    });

    // Activar eventos personalizados del carrito
    socketCarro(io, socket);

    // Evento de desconexión
    socket.on('disconnect', () => {
        console.log('cliente desconectado');
    });
});

// Middleware para inyectar `io` en cada petición HTTP
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Tarea programada: limpieza de carritos antiguos cada día a las 3:00 AM
cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Ejecutando limpieza de carros antiguos...');
    try {
        await eliminarCarrosAntiguos();
    } catch (error) {
        console.error('❌ Error al eliminar carros antiguos:', error);
    }
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(process.cwd(), 'public')));

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Middleware para permitir CORS
app.use(cors());

// Registrar rutas principales
app.use('/productos', rutaProductos);
app.use('/login', rutaLogin);
app.use('/clientes', rutaClientes);
app.use('/carros', rutaCarros);
app.use("/pago", rutaPago);

// Puerto en el que se ejecuta el servidor
const PORT = 3001;

// Iniciar el servidor
server.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));