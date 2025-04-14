import Producto from './Producto.js';
import TiendaDB from '../database/TiendaDB.js';



/**
 * Clase Productos
 * Será la encargada de gestionar las operaciones CRUD de los productos
 * @class Productos
 */
class Productos {
    constructor() {
        this.client = null;
    }

    async conectar(){
        this.client = await TiendaDB.conectar();
    }

    async listar(){
        const consulta = 'SELECT * FROM productos';
        const parametros = [];
        const result =  await TiendaDB.consultar(this.client, consulta,parametros);
        if (result.length > 0){
                const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio, 
                                        producto.stock, producto.imagen, producto.categoria));
                return productos;
        }
        else return null;
        
    }

    async insertar(producto) {
        const consulta = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria)
                          VALUES ($1,$2,$3,$4,$5,$6)
                          RETURNING *`;
        const parametros = [producto.nombre, producto.descripcion, producto.precio, producto.stock,
                        producto.imagen, producto.categoria];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async actualizar(producto) {
        const consulta = `UPDATE productos 
                          SET nombre=$1, descripcion=$2,
                              precio=$3, stock=$4, imagen=$5,
                              categoria=$6 
                          WHERE id=$7`;
        const parametros = [producto.nombre, producto.descripcion, producto.precio, producto.stock,
                        producto.imagen, producto.categoria,producto.id];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async eliminar(producto) {
        const consulta = `DELETE FROM productos WHERE id=$1`;
        const parametros = [producto.id];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        return result;
    }

    async buscarPorId(id){
        const consulta = `SELECT * FROM productos WHERE id=$1`;
        const parametros = [id];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        if (result.length > 0) {
            return new Producto(result[0].id, result[0].nombre, result[0].descripcion, result[0].precio,
                                result[0].stock, result[0].imagen, result[0].categoria);
        } 
        else return null;
        
    }

    async buscarPorDescripcion(descripcion){
        const arrayDescripcion = descripcion.split(' ');
        const consulta = `SELECT * FROM productos WHERE descripcion LIKE '%$1%'`;
        const parametros = [arrayDescripcion[0]];
        const indexParam = 2;
        if (arrayDescripcion.length > 1){
            for (let i=1; i < arrayDescripcion.length; i++){
                consulta += ` OR descripcion LIKE '%$${indexParam}%'`;
                parametros.push(arrayDescripcion[i]);
                indexParam += 1;
            }
        }

        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio, 
                                        producto.stock, producto.imagen, producto.categoria));
        return productos;
    }

    async buscarPorCategoria(categoria){
        const consulta = `SELECT * FROM productos WHERE categoria=$1`;
        const parametros = [categoria];
        const result = await TiendaDB.consultar(this.client, consulta, parametros);
        const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio,
                                        producto.stock, producto.imagen, producto.categoria));
        
        return productos;

    }

}

export default Productos;