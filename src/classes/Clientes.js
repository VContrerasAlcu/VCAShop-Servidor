import Cliente from 'Cliente.js';
import TiendaDB from '../database/TiendaDB';

class Clientes{
    constructor(){
        this.client = TiendaDB.conectar();
    }

    buscar(email){
        const consulta = `SELECT * FROM clientes WHERE email='${email}'`;
        const result = TiendaDB.consultar(this.client, consulta);
        if (result.length>0){
            const cliente = result[0];
            return new Cliente(
                cliente.email, cliente.nombre, cliente.direccion, cliente.telefono,
                cliente.direccionenvio, cliente.password
                )
        }
    }

    insertar(cliente){
        const consulta = `INSERT INTO clientes (email, nombre, direccion, telefono, direccionenvio, password) VALUES
                            ('${cliente.email}', '${cliente.nombre}', '${cliente.direccion}', '${cliente.telefono}',
                             '${cliente.direccionenvio}', '${cliente.password}')`;
        
        const result = TiendaDB.consultar(this.client, consulta);
       

    }
}