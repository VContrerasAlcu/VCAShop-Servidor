import TiendaDB from "../database/TiendaDB.js";

class Carros {
    
    constructor(){
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async agregarCarro(email, carro){
        const consulta = `INSERT INTO  carros(email,carro) VALUES ($1,$2)`;
        const parametros = [email, JSON.stringify(carro)];
        try{
            const result = await TiendaDB.consultar(this.client, consulta, parametros);
            return result.rowCount > 0;
        } 
        catch (error){
            console.error('Error al realizar la consulta: ', error);
            return false;
        }
        
    }

    async carro(email){
        const consulta = `SELECT carro FROM carros WHERE email=$1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.lenght > 0) return result[0].carro;
        else return null;
    }

    async carroVacio(email){
        const carro = await this.carro(email);
        if (carro.lenght === 0) return true;
        return false;

    }

    async existeCarro(email){
        const consulta = `SELECT * FROM carros WHERE email=$1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result.lenght > 0 ? true : false;
    }


}

export default Carros