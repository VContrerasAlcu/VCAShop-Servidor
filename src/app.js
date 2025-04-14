import express from 'express';
import rutaProductos from './routes/productos.js';


const app = express();
app.use(express.json());

app.use('/productos',rutaProductos);

const PORT = 3001;
app.listen(PORT, () => console.log(`servidor escuchando en http://localhost:${PORT}..`));




