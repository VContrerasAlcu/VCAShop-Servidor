import pkg from 'pg';
const { Pool } = pkg;

/**
 * Clase TiendaDB
 * Esta clase te ayuda a conectarte a una base de datos PostgreSQL, hacer consultas y cerrar la conexión.
 */
class TiendaDB {
    /**
     * Conecta con la base de datos.
     * @returns {Promise<object>} Devuelve un cliente que puedes usar para hacer consultas.
     */
    static async conectar() {
        const pool = new Pool({
            user: 'vicente',       // Usuario de la base de datos
            host: 'localhost',     // Dirección del servidor
            database: 'tienda',    // Nombre de la base de datos
            password: 'vicente',   // Contraseña del usuario
            port: 5432,            // Puerto por defecto de PostgreSQL
        });

        try {
            const client = await pool.connect(); // Intenta conectarse
            return client;
        } catch (error) {
            console.error('No se pudo conectar a la base de datos', error);
            throw error;
        }
    }

    /**
     * Hace una consulta SQL a la base de datos.
     * @param {object} client - El cliente que obtuviste al conectar.
     * @param {string} consulta - El texto SQL que quieres ejecutar.
     * @param {Array} parametros - Los valores que quieres pasar a la consulta.
     * @returns {Promise<Array>} Devuelve los resultados de la consulta.
     */
    static async consultar(client, consulta, parametros) {
        try {
            const result = await client.query(consulta, parametros);
            console.log('Resultado de la consulta:', result.rows);
            return result.rows;
        } catch (error) {
            console.error('Hubo un error al hacer la consulta', error);
            throw error;
        }
    }

    /**
     * Cierra la conexión con la base de datos.
     * @param {object} client - El cliente que estabas usando.
     */
    static async desconectar(client) {
        try {
            await client.release(); // Libera el cliente
        } catch (error) {
            console.error('No se pudo cerrar la conexión', error);
            throw error;
        }
    }
}

export default TiendaDB;