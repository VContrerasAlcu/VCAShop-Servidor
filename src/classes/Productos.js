import Producto from './Producto.js';
import TiendaDB from '../database/TiendaDB.js';



/**
 * Clase Productos
 * Será la encargada de gestionar las operaciones CRUD de los productos
 * @class Productos
 */
class Productos {
    constructor() {
        this.client = TiendaDB.conectar();
    }

    listar(){
        const consulta = 'SELECT * FROM productos';
        const result =  TiendaDB.consultar(this.client, consulta);
        const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio, 
                                        producto.stock, producto.imagen, producto.categoria));
        return productos;
    }

    insertar(producto) {
        const consulta = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) VALUES (
                        '${producto.nombre}', ${producto.descripcion}, ${producto.precio}, '${producto.stock},
                        '${producto.imagen}', '${producto.categoria}')`;
        TiendaDB.consultar(this.client, consulta);
    }

    modificar(producto) {
        const consulta = `UPDATE productos SET nombre='${producto.nombre}', descripcion='${producto.descripcion}',
                        precio=${producto.precio}, stock='${producto.stock}', imagen='${producto.imagen}',
                        categoria='${producto.categoria}' WHERE id=${producto.id}`;
        TiendaDB.consultar(this.client, consulta);
    }

    eliminar(producto) {
        const consulta = `DELETE FROM productos WHERE id=${producto.id}`;
        TiendaDB.consultar(this.client, consulta);
    }

    buscarPorId(id){
        const consulta = `SELECT * FROM productos WHERE id=${id}`;
        const result = TiendaDB.consultar(this.client, consulta);
        if (result.length > 0) {
            return new Producto(result[0].id, result[0].nombre, result[0].descripcion, result[0].precio,
                                result[0].stock, result[0].imagen, result[0].categoria);
        } else {
            return null;
        }

    }

    buscarPorDescripcion(descripcion){
        const arrayDescripcion = descripcion.split(' ');
        const consulta = `SELECT * FROM productos WHERE descripcion LIKE '%${arrayDescripcion[0]}%'`;
        if (arrayDescripcion.length > 1){
            for (let i=1; i < arrayDescripcion.length; i++){
                consulta += ` OR descripcion LIKE '%${arrayDescripcion[i]}%'`;
            }
        }

        const result = TiendaDB.consultar(this.client, consulta);
        const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio, 
                                        producto.stock, producto.imagen, producto.categoria));
        return productos;
    }

    buscarPorCategoria(categoria){
        const consulta = `SELECT * FROM productos WHERE categoria='${categoria}'`;
        const result = TiendaDB.consultar(this.client,consulta);
        const productos = result.map((producto) => new Producto(
                                        producto.id, producto.nombre, producto.descripcion, producto.precio,
                                        producto.stock, producto.imagen, producto.categoria));
        
        return productos;

    }


                        


}