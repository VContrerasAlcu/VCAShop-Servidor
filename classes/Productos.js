import Producto from './Producto.js';
import TiendaDB from '../database/TiendaDB.js';

/**
 * Clase Productos
 * Gestiona las operaciones CRUD de los productos en la base de datos.
 */
class Productos {
    constructor() {
        this.client = null;
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
     * Lista todos los productos disponibles.
     * @returns {Promise<Array<Producto>|null>} Array de productos o null si no hay ninguno.
     */
    async listar() {
        const consulta = 'SELECT * FROM productos';
        const result = await TiendaDB.consultar(this.client, consulta, []);
        if (result.length > 0) {
            return result.map(p => new Producto(
                p.id, p.nombre, p.descripcion, p.precio,
                p.stock, p.imagen, p.categoria, p.destacado
            ));
        } else {
            return null;
        }
    }

    /**
     * Inserta un nuevo producto en la base de datos.
     * @param {Producto} producto - Producto a insertar.
     * @returns {Promise<object>} Resultado de la consulta.
     */
    async insertar(producto) {
        const consulta = `
            INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria, destacado)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const parametros = [
            producto.nombre, producto.descripcion, producto.precio,
            producto.stock, producto.imagen, producto.categoria, producto.destacado
        ];
        return await TiendaDB.consultar(this.client, consulta, parametros);
    }

    /**
     * Actualiza los datos de un producto existente.
     * @param {Producto} producto - Producto con datos actualizados.
     * @returns {Promise<object>} Resultado de la consulta.
     */
    async actualizar(producto) {
        const consulta = `
            UPDATE productos
            SET nombre = $1, descripcion = $2,
                precio = $3, stock = $4, imagen = $5,
                categoria = $6, destacado = $7
            WHERE id = $8
        `;
        const parametros = [
            producto.nombre, producto.descripcion, producto.precio,
            producto.stock, producto.imagen, producto.categoria,
            producto.destacado, producto.id
        ];
        return await TiendaDB.consultar(this.client, consulta, parametros);
    }

    /**
     * Elimina un producto de la base de datos.
     * @param {Producto} producto - Producto a eliminar.
     * @returns {Promise<object>} Resultado de la consulta.
     */
    async eliminar(producto) {
        const consulta = `DELETE FROM productos WHERE id = $1`;
        return await TiendaDB.consultar(this.client, consulta, [producto.id]);
    }

    /**
     * Busca un producto por su ID.
     * @param {number} id - ID del producto.
     * @returns {Promise<Producto|null>} Producto encontrado o null si no existe.
     */
    async buscarPorId(id) {
        const consulta = `SELECT * FROM productos WHERE id = $1`;
        const result = await TiendaDB.consultar(this.client, consulta, [id]);
        if (result.length > 0) {
            const p = result[0];
            return new Producto(p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.categoria, p.destacado);
        } else {
            return null;
        }
    }

    /**
     * Busca productos que contengan palabras clave en su descripción.
     * @param {string} descripcion - Texto a buscar.
     * @returns {Promise<Array<Producto>>} Lista de productos que coinciden.
     */
    async buscarPorDescripcion(descripcion) {
        const palabras = descripcion.split(' ');
        let condiciones = palabras.map((_, i) => `descripcion ILIKE $${i + 1}`).join(' OR ');
        const consulta = `SELECT * FROM productos WHERE ${condiciones}`;
        const parametros = palabras.map(p => `%${p}%`);
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result.map(p => new Producto(
            p.id, p.nombre, p.descripcion, p.precio,
            p.stock, p.imagen, p.categoria, p.destacado
        ));
    }

    /**
     * Busca productos por categoría.
     * @param {string} categoria - Nombre de la categoría.
     * @returns {Promise<Array<Producto>>} Lista de productos en esa categoría.
     */
    async buscarPorCategoria(categoria) {
        const consulta = `SELECT * FROM productos WHERE categoria = $1`;
        const result = await TiendaDB.consultar(this.client, consulta, [categoria]);
        return result.map(p => new Producto(
            p.id, p.nombre, p.descripcion, p.precio,
            p.stock, p.imagen, p.categoria, p.destacado
        ));
    }

    /**
     * Consulta el stock actual de un producto.
     * @param {Producto} producto - Producto a consultar.
     * @returns {Promise<number>} Cantidad disponible en stock.
     */
    async consultarStock(producto) {
        const consulta = `SELECT stock FROM productos WHERE id = $1`;
        const result = await TiendaDB.consultar(this.client, consulta, [producto.id]);
        return result[0].stock;
    }
}

export default Productos;