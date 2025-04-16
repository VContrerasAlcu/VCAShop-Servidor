import pkg from 'pg';
const { Pool } = pkg;

class TiendaDB{
    static async conectar(){
        const pool = new Pool({
            user: 'vicente',
            host: 'localhost',
            database: 'tienda',
            password: 'vicente',
            port: 5432,
        });

        try{
            const client = await pool.connect();
            return client;
        }
        catch (error){
            console.error('Error al conectar a la base de datos', error);
            throw error;
        }
    }
    static async consultar(client, consulta, parametros){
        try{
            const result = await client.query(consulta,parametros);
            return result.rows;
        }
        catch (error){
            console.error('Error al consultar la base de datos', error);
            throw error;
        }
    }
    static async desconectar(client){
        try{
            await client.release();
        }
        catch (error){
            console.error('Error al desconectar de la base de datos', error);
            throw error;
        }
    }
}

export default TiendaDB;


