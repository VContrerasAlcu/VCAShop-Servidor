import express from 'express';
import rutaProductos from './routes/productos.js';
import  cors from 'cors';
import path from 'path';

const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(cors());


app.use('/productos',rutaProductos);

const PORT = 3001;
app.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));




