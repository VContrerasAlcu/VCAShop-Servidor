// Importación de clases y funciones necesarias
import Carros from '../classes/Carros.js'; // Clase para gestionar múltiples carritos en la base de datos
import Carro from '../classes/Carro.js'; // Clase que representa un carrito individual en memoria
import { verificarToken } from '../controllers/auth.js'; // Función para validar el token del cliente

/**
 * Función que gestiona los eventos de carrito vía WebSocket
 * @param {Server} io - Instancia principal de Socket.IO
 * @param {Socket} socket - Socket individual conectado
 */
export function socketCarro(io, socket) {
    console.log('estoy en socketscarros'); // Confirmación de que se ha cargado el módulo

    /**
     * Evento: 'agregar'
     * Añade un producto al carrito del cliente
     */
    socket.on('agregar', async (data) => {
        console.log('recibido el socket agregar en el servidor');
        const cliente = data.cliente;
        let respuesta = false;

        // Verificar si el token del cliente es válido
        if (verificarToken(cliente.token).exito) {
            const carros = new Carros();
            await carros.conectar();

            // Obtener el carrito actual del cliente
            const carro = new Carro(await carros.carro(cliente.email));
            console.log(`carro antes de agregar: ${carro.cargar()}`);

            // Agregar producto al carrito
            const result = await carro.agregar(data.producto, data.cantidad);
            console.log(`carro después de agregar: ${carro.cargar()[0].producto.nombre}`);

            if (result !== false) {
                // Emitir evento para actualizar el stock en el cliente
                console.log(`antes del emit. ${data.producto.nombre}, ${data.producto.stock}`);
                socket.emit('stock_actualizado', result);

                // Guardar el carrito actualizado en la base de datos
                if (await carros.existeCarro(cliente.email)) {
                    console.log(`el carro del cliente existe`);
                    const NuevoCarro = carros.actualizar(cliente.email, carro.cargar());
                    console.log(`carro actualizado: ${NuevoCarro}`);
                } else {
                    console.log(`el carro del cliente no existe`);
                    await carros.agregarCarro(cliente.email, carro.cargar());
                }

                // Preparar respuesta con el nuevo estado del carrito
                respuesta = carro.cargar();
                console.log(`carro enviado a respuesta agregar: ${respuesta[0].producto.nombre}`);
            }

            await carros.desconectar(); // Cerrar conexión con la base de datos
        }

        // Enviar respuesta al cliente con el estado del carrito
        socket.emit('respuesta_agregar', respuesta);
    });

    /**
     * Evento: 'quitar'
     * Elimina un producto del carrito del cliente
     */
    socket.on('quitar', async (data) => {
        console.log('recibido el socket quitar en el servidor');
        const cliente = data.cliente;
        let respuesta = false;

        // Verificar token
        if (verificarToken(cliente.token).exito) {
            const carros = new Carros();
            await carros.conectar();

            // Obtener el carrito actual
            const carro = new Carro(await carros.carro(cliente.email));
            console.log(`carro antes de quitar: ${carro.cargar()}`);

            // Quitar producto del carrito
            const result = await carro.quitar(data.producto);

            // Mostrar estado del carrito tras quitar
            if (carro.cargar().length > 0) {
                console.log(`Carro después de quitar: ${carro.cargar()[0].producto.nombre}`);
            } else {
                console.log("El carrito está vacío después de quitar.");
            }

            if (result !== false) {
                // Emitir evento para actualizar el stock
                console.log(`antes del emit. ${data.producto.nombre}, ${data.producto.stock}`);
                socket.emit('stock_actualizado', result);

                // Guardar cambios en la base de datos
                if (await carros.existeCarro(cliente.email)) {
                    console.log(`el carro del cliente existe`);
                    await carros.actualizar(cliente.email, carro.cargar());
                } else {
                    console.log(`el carro del cliente no existe`);
                    await carros.agregarCarro(cliente.email, carro.cargar());
                }

                respuesta = carro.cargar(); // Preparar respuesta
            }

            await carros.desconectar(); // Cerrar conexión
        }

        // Enviar respuesta al cliente
        socket.emit('respuesta_quitar', respuesta);
    });

    /**
     * Evento: 'vaciar'
     * Vacía completamente el carrito del cliente
     */
    socket.on('vaciar', async (data) => {
        const cliente = data.cliente;
        const carros = new Carros();
        await carros.conectar();

        // Vaciar el carrito en la base de datos
        const carroVaciado = await carros.vaciar(cliente.email);
        console.log(`estoy en socket vaciar, email= ${cliente.email}, carroVaciado = ${carroVaciado}`);

        // Enviar confirmación al cliente
        socket.emit('respuesta_vaciar', carroVaciado);
    });
}