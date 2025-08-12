import express from 'express';
import rutaProductos from './routes/productos.js';
import rutaLogin from './routes/login.js';
import rutaClientes from './routes/clientes.js';
import rutaCarros from './routes/carros.js';
import rutaPago from "./routes/pago.js";
import  cors from 'cors';
import path from 'path';
import http from 'http';
import {Server} from 'socket.io';
import {socketCarro} from './sockets/socketsCarros.js';
import { eliminarCarrosAntiguos } from './servicios/LimpiezaCarros.js';
import cron from 'node-cron';

const listaClientes = {};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    
    console.log('Conexion de cliente efectuada');
    socket.on('registro', (email) => {
        socket.join(email);
    })

    socketCarro(io,socket);
    

    socket.on('disconnect', () => {
        console.log('cliente desconectado')
    });
});

app.use((req,res,next) => {
    req.io = io;
    next();
})

cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Ejecutando limpieza de carros antiguos...');
  try {
    await eliminarCarrosAntiguos();
  } catch (error) {
    console.error('❌ Error al eliminar carros antiguos:', error);
  }
});




app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(cors());


app.use('/productos',rutaProductos);
app.use('/login', rutaLogin);
app.use('/clientes',rutaClientes);
app.use('/carros', rutaCarros);
app.use("/pago", rutaPago);



const PORT = 3001;
server.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));




