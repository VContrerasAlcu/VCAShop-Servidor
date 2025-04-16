import express from 'express';
import TiendaDB from './TiendaDB.js';
import { faker } from '@faker-js/faker';


const cliente = await TiendaDB.conectar();

const numDatos = 100;
const pedidos = 200;

for (let i=0; i < numDatos; i++){
    const mail = faker.internet.email();
    const password = faker.internet.password();
    const nombre = faker.person.firstName();
    const direccion = faker.location.streetAddress();
    const telefono = faker.phone.number({ style: 'national' });
    const direccionEnvio = faker.location.streetAddress();

    const indiceImagen = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    const categorias = ['electronica', 'ropa', 'hogar', 'juguetes'];
    const categoriaElegida = categorias[Math.floor(Math.random() * categorias.length)];
    const stock = Math.floor(Math.random() * (100 - 1 + 1)) + 1;


    const nombreProducto = faker.commerce.productName();
    const descripcion = faker.commerce.productDescription();
    const precio = faker.commerce.price();
    const imagen = `../public/images/imagen${indiceImagen}.jpg`;
    const categoria = categoriaElegida;

    const consulta = `INSERT INTO clientes (email, password, nombre, direccion, telefono, direccionenvio) VALUES ('${mail}', '${password}','${nombre}', '${direccion}', '${telefono}', '${direccionEnvio}');`;
    await TiendaDB.consultar(cliente, consulta);
    const consulta2 = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) VALUES ('${nombreProducto}', '${descripcion}', ${precio}, ${stock}, '${imagen}', '${categoria}');`;
    await TiendaDB.consultar(cliente, consulta2);
}
