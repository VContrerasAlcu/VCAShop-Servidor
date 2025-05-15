import express from 'express';
import rutaProductos from './routes/productos.js';
import rutaLogin from './routes/login.js';
import rutaClientes from './routes/clientes.js';
import rutaCarros from './routes/carros.js';
import  cors from 'cors';
import path from 'path';
import http from 'http';
import {Server} from 'socket.io';



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
    socket.on('registro', (emailCliente) => {
        console.log('cliente conectado con email: ', emailCliente);
        listaClientes[emailCliente] = socket.id;
    });

    socket.on('disconnect', () => {
        const email = Object.keys(listaClientes).find(key => listaClientes[key] == socket.id);
        delete(listaClientes[email]);

    });
});


app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(cors());


app.use('/productos',rutaProductos);
app.use('/login', rutaLogin);
app.use('/clientes',rutaClientes(io, listaClientes));
app.use('/carros', rutaCarros(io, listaClientes));

const PORT = 3001;
server.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));




