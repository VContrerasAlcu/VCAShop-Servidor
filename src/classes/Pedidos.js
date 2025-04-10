import Pedido from 'Pedido.js';
import TiendaDB from '../database/TiendaDB';
import { timeStamp } from 'console';

class Pedidos {
    constructor() {
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async insertar(pedido){
        const consulta = `INSERT INTO pedidos(cliente_email, producto_id, cantidad, fecha_pedido, estado, direccionenvio)
                          VALUES ($1, $2, $3, $4, $5, $6)`;
        const parametros = [pedido.email, pedido.producto_id, pedido.cantidad, producto.fecha_pedido,
                            pedido.estado, pedido.direccionenvio];

        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async buscar(id){
        const consulta = `SELECT * FROM pedidos WHERE id=$1`;
        const parametros = [id];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.length >0){
            const pedido = new Pedido(result[0].cliente_email, result[0].producto_id,result[0].cantidad,
                                      result[0].fecha_pedido, result[0].estado, result[0].direccionenvio
                                    );
            return pedido;
        }
        else return null;
    }

    async buscarPorCliente(cliente){
        const consulta = 'SELECT * FROM pedidos WHERE cliente_email=$1';
        const parametros = [cliente.email];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.length > 0){
            const pedidos = result.map((pedido) => new Pedido(pedido.cliente_email, pedido.producto_id, pedido.cantidad,
                                                              pedido.fecha_pedido, pedido.estado, pedido.direccionenvio
                                                            )
                                       );
            return pedidos;
        }
        else return null;
    }

    async buscarPorProducto(producto){
        const consulta = 'SELECT * FROM pedidos WHERE producto_id=$1';
        const parametros = [producto.id];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.length > 0){
            const pedidos = result.map((pedido) => new Pedido(pedido.cliente_email, pedido.producto_id, pedido.cantidad,
                                                              pedido.fecha_pedido, pedido.estado, pedido.direccionenvio
                                                            )
                                       );
            return pedidos;
        }
        else return null;
    }

    async actualizar(pedido){
        const consulta = `UPDATE pedidos
                          SET cliente_email=$1, producto_id=$2, cantidad=$3, 
                              fecha_pedido=$4, estado=$5, direccionenvio=$6
                          WHERE id=$7`;
        const parametros = [pedido.cliente_email, pedido.producto_id, pedido.cantidad, pedido.fecha_pedido,
                            pedido.estado, pedido.direccionenvio, pedido.id]
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }



}