import TiendaDB from "../database/TiendaDB.js";

class Carros {
    
    constructor(){
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async desconectar(){
        await TiendaDB.desconectar(this.client);
    }

    async agregarCarro(email, carro){
        const consulta = `INSERT INTO  carros(email,carro) VALUES ($1,$2)`;
        const parametros = [email,JSON.stringify(carro)];
        try{
            const result = await TiendaDB.consultar(this.client, consulta, parametros);
            return result.rowCount > 0;
        } 
        catch (error){
            console.error('Error al realizar la consulta: ', error);
            return false;
        }
        
    }

    async actualizar(email, carro) {
        const consulta = `UPDATE carros
                            SET carro=$1
                            WHERE email=$2 
                            RETURNING * `;
        const parametros = [JSON.stringify(carro),email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async carro(email){
        const consulta = `SELECT carro FROM carros WHERE email=$1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result?.length > 0) return result[0].carro;
        else return [];
    }

    async carroVacio(email){
        const carro = await this.carro(email);
        if (carro.length === 0) return true;
        return false;

    }

    async existeCarro(email){
        const consulta = `SELECT email FROM carros WHERE email=$1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        console.log(`Resultado de la consulta existe carro: ${result.length}`);
        return result?.length > 0;
    }


}

export default Carros