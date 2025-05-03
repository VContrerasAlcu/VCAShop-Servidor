import express from 'express';
import rutaProductos from './routes/productos.js';
import rutaLogin from './routes/login.js';
import rutaClientes from './routes/clientes.js';
import  cors from 'cors';
import path from 'path';
import http from 'http';
import {Server} from 'socket.io';




const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST']
    }
});



app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(cors());


app.use('/productos',rutaProductos);
app.use('/login', rutaLogin);
app.use('/clientes',rutaClientes(io));

const PORT = 3001;
server.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));




