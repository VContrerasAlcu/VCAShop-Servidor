import TiendaDB from "../database/TiendaDB.js";
import Compra from "./Compra.js";

class Compras {
    
    constructor(){
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async desconectar(){
        await TiendaDB.desconectar(this.client);
    }

    async agregarCompra(compra){
        const consulta = `INSERT INTO  compras(codigoredsys, email, carro, total, fecha, estado) 
                          VALUES ($1,$2,$3,$4,$5,$6)`;
        const parametros = [compra.codigoredsys, compra.email, JSON.stringify(compra.carro), 
                            compra.total, compra.fecha, compra.estado];
        try{
            const result = await TiendaDB.consultar(this.client, consulta, parametros);
            return result.rowCount > 0;
        } 
        catch (error){
            console.error('Error al realizar la consulta: ', error);
            return false;
        }
        
    }

    async actualizarCompra(compra) {
        const consulta = `UPDATE compras
                            SET email=$1,
                                carro=$2,
                                total=$3,
                                fecha=$4,
                                estado=$5
                            WHERE codigoredsys=$6 
                            RETURNING * `;
        const parametros = [compra.email, JSON.stringify(compra.carro), compra.total, 
                            compra.fecha, compra.estado, compra.codigoredsys];
        console.log('valores llegados en compra dentro de actualizarcompra: ', compra);
    
        const result = await TiendaDB.consultar(this.client, consulta, parametros);

        console.log('log de actualizarCompra: ', result);
        if (result.length > 0) return result[0];
        else return null;
    }

    async carro(compra){
        const consulta = `SELECT carro FROM compras WHERE codigoredsys=$1`;
        const parametros = [compra.codigoredsys];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result?.length > 0) return result.rows[0];
        else return [];
    }

    async compra(codigoredsys){
        const consulta = `SELECT codigoredsys,email,carro,total,fecha,estado
                          FROM compras
                          WHERE codigoredsys = $1`;
        const parametros = [codigoredsys];
        
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        console.log('result en compras.compra',result);
        const compra = new Compra(result[0].codigoredsys, result[0].email, result[0].carro, result[0].total,
                                result[0].fecha, result[0].estado);
        
        if (result.length > 0) return (compra);
        else return null;
        
    }

    async existeCompra(codigoredsys){
        const consulta = `SELECT email
                          FROM compras
                          WHERE codigoredsys = $1`;
        const parametros = [codigoredsys];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result?.length > 0;
    }




}

export default Compras