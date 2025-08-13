import TiendaDB from "../database/TiendaDB.js";
import Compra from "./Compra.js";

/**
 * Clase Compras
 * Administra las compras realizadas por los clientes en la base de datos.
 */
class Compras {
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
     * Cierra la conexión con la base de datos.
     * @returns {Promise<void>}
     */
    async desconectar() {
        await TiendaDB.desconectar(this.client);
    }

    /**
     * Registra una nueva compra en la base de datos.
     * @param {Compra} compra - Instancia de Compra a guardar.
     * @returns {Promise<boolean>} True si se insertó correctamente.
     */
    async agregarCompra(compra) {
        const consulta = `
            INSERT INTO compras(codigoredsys, email, carro, total, fecha, estado)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const parametros = [
            compra.codigoredsys,
            compra.email,
            JSON.stringify(compra.carro),
            compra.total,
            compra.fecha,
            compra.estado
        ];

        try {
            const result = await TiendaDB.consultar(this.client, consulta, parametros);
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            return false;
        }
    }

    /**
     * Actualiza los datos de una compra existente.
     * @param {Compra} compra - Instancia de Compra con los datos actualizados.
     * @returns {Promise<object|null>} Compra actualizada o null si no se encontró.
     */
    async actualizarCompra(compra) {
        const consulta = `
            UPDATE compras
            SET email = $1,
                carro = $2,
                total = $3,
                fecha = $4,
                estado = $5
            WHERE codigoredsys = $6
            RETURNING *
        `;
        const parametros = [
            compra.email,
            JSON.stringify(compra.carro),
            compra.total,
            compra.fecha,
            compra.estado,
            compra.codigoredsys
        ];

        console.log('Valores recibidos en actualizarCompra:', compra);
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        console.log('Resultado de actualizarCompra:', result);

        return result.length > 0 ? result[0] : null;
    }

    /**
     * Obtiene el carrito asociado a una compra.
     * @param {Compra} compra - Instancia de Compra.
     * @returns {Promise<object|Array>} Carrito guardado o array vacío si no se encuentra.
     */
    async carro(compra) {
        const consulta = `SELECT carro FROM compras WHERE codigoredsys = $1`;
        const parametros = [compra.codigoredsys];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result?.length > 0 ? result.rows[0] : [];
    }

    /**
     * Obtiene una compra completa por su código.
     * @param {string} codigoredsys - Código de referencia de la compra.
     * @returns {Promise<Compra|null>} Instancia de Compra o null si no existe.
     */
    async compra(codigoredsys) {
        const consulta = `
            SELECT codigoredsys, email, carro, total, fecha, estado
            FROM compras
            WHERE codigoredsys = $1
        `;
        const parametros = [codigoredsys];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        console.log('Resultado en compras.compra:', result);

        if (result.length > 0) {
            const compra = new Compra(
                result[0].codigoredsys,
                result[0].email,
                result[0].carro,
                result[0].total,
                result[0].fecha,
                result[0].estado
            );
            return compra;
        } else {
            return null;
        }
    }

    /**
     * Verifica si existe una compra con el código dado.
     * @param {string} codigoredsys - Código de referencia de la compra.
     * @returns {Promise<boolean>} True si existe.
     */
    async existeCompra(codigoredsys) {
        const consulta = `
            SELECT email
            FROM compras
            WHERE codigoredsys = $1
        `;
        const parametros = [codigoredsys];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result?.length > 0;
    }
}

export default Compras;