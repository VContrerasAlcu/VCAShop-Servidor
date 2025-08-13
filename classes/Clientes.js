import Cliente from './Cliente.js';
import TiendaDB from '../database/TiendaDB.js';

/**
 * Clase Clientes
 * Gestiona operaciones relacionadas con los clientes en la base de datos:
 * búsqueda, inserción y actualización.
 */
class Clientes {
    constructor() {
        this.client = null; // Cliente de conexión a la base de datos
    }

    /**
     * Conecta con la base de datos.
     * @returns {Promise<void>}
     */
    async conectar() {
        this.client = await TiendaDB.conectar();
    }

    /**
     * Busca un cliente por su email.
     * @param {string} email - Email del cliente.
     * @returns {Promise<Cliente|null>} Instancia de Cliente si existe, o null si no se encuentra.
     */
    async buscar(email) {
        const consulta = `SELECT * FROM clientes WHERE email = $1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);

        if (result.length > 0) {
            const cliente = result[0];
            return new Cliente(
                cliente.email,
                cliente.password,
                cliente.nombre,
                cliente.direccion,
                cliente.telefono
            );
        } else {
            return null;
        }
    }

    /**
     * Inserta un nuevo cliente en la base de datos.
     * Si el cliente no tiene nombre, solo se guarda email y contraseña.
     * @param {Cliente} cliente - Instancia de Cliente a insertar.
     * @returns {Promise<object>} Resultado de la consulta.
     */
    async insertar(cliente) {
        let consulta, parametros;

        if (!cliente.nombre) {
            consulta = `INSERT INTO clientes (email, password) VALUES ($1, $2)`;
            parametros = [cliente.email, cliente.password];
        } else {
            consulta = `INSERT INTO clientes (email, password, nombre) VALUES ($1, $2, $3)`;
            parametros = [cliente.email, cliente.password, cliente.nombre];
        }

        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    /**
     * Actualiza los datos de un cliente en la base de datos.
     * @param {Cliente} cliente - Instancia de Cliente con los datos actualizados.
     * @returns {Promise<object>} Resultado de la consulta.
     */
    async actualizar(cliente) {
        const consulta = `
            UPDATE clientes
            SET nombre = $1, password = $2, direccion = $3, telefono = $4
            WHERE email = $5
        `;
        const parametros = [
            cliente.nombre,
            cliente.password,
            cliente.direccion,
            cliente.telefono,
            cliente.email
        ];

        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }
}

export default Clientes;