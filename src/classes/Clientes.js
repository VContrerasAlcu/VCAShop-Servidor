import Cliente from 'Cliente.js';
import TiendaDB from '../database/TiendaDB';

class Clientes{
    constructor(){
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async buscar(email){
        const consulta = `SELECT * FROM clientes WHERE email=$1`;
        const parametros = [email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.length>0){
            const cliente = result[0];
            return new Cliente(
                cliente.email, cliente.password, cliente.nombre, cliente.direccion, cliente.telefono 
                )
        }
        else return null;
    }

    async insertar(cliente){
        const consulta = `INSERT INTO clientes (email, password) VALUES ($1, $2)`;        
        const parametros = [cliente.email, cliente.password];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async actualizar(cliente){
        const consulta = `UPDATE clientes
                          SET nombre=$1,  password=$5, direccion=$2, telefono=$3,
                          WHERE email=$6`;

        const parametros = [cliente.nombre, cliente.password, cliente.direccion, cliente.telefono, 
                            cliente.email];
        
        const result = TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }
}