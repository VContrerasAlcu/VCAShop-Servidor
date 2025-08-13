import express from 'express';
import TiendaDB from './TiendaDB.js';
import { faker } from '@faker-js/faker';

// Conectamos a la base de datos
const cliente = await TiendaDB.conectar();

// Cantidad de datos que queremos generar
const numDatos = 100;  // Número de clientes y productos
const pedidos = 200;   // (No se usa en este fragmento, pero puede servir más adelante)

// Bucle para generar datos falsos
for (let i = 0; i < numDatos; i++) {
    // Datos falsos para clientes
    const mail = faker.internet.email();
    const password = faker.internet.password();
    const nombre = faker.person.firstName();
    const direccion = faker.location.streetAddress();
    const telefono = faker.phone.number({ style: 'national' });
    const direccionEnvio = faker.location.streetAddress();

    // Datos falsos para productos
    const indiceImagen = Math.floor(Math.random() * 4) + 1; // imagen1 a imagen4
    const categorias = ['electronica', 'ropa', 'hogar', 'juguetes'];
    const categoriaElegida = categorias[Math.floor(Math.random() * categorias.length)];
    const stock = Math.floor(Math.random() * 100) + 1;

    const nombreProducto = faker.commerce.productName();
    const descripcion = faker.commerce.productDescription();
    const precio = faker.commerce.price();
    const imagen = `../public/images/imagen${indiceImagen}.jpg`;
    const categoria = categoriaElegida;

    // Insertamos cliente en la base de datos
    const consultaCliente = `
        INSERT INTO clientes (email, password, nombre, direccion, telefono, direccionenvio)
        VALUES ('${mail}', '${password}', '${nombre}', '${direccion}', '${telefono}', '${direccionEnvio}');
    `;
    await TiendaDB.consultar(cliente, consultaCliente);

    // Insertamos producto en la base de datos
    const consultaProducto = `
        INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria)
        VALUES ('${nombreProducto}', '${descripcion}', ${precio}, ${stock}, '${imagen}', '${categoria}');
    `;
    await TiendaDB.consultar(cliente, consultaProducto);
}