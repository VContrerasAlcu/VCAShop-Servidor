import Productos from './Productos.js';
class Carro{
    

    constructor(contenido = null){
        this.contenido = contenido;
        this.productos = new Productos();
    }

    async agregar(producto, cantidad){
        const stock = await this.productos.consultarStock(producto);
        if (cantidad <= stock){
            const indice = existeProducto(producto);
            if (indice !== -1){
                this.contenido[indice].id_cantidad += cantidad;
                
            }
            else {
                this.contenido.push(producto, cantidad);
            }
            producto.stock -= cantidad;
            await this.productos.actualizar(producto);
            return true;

        }
        else return false;
    
    }

    async quitar(producto, cantidad){
        const indice = existeProducto(producto);
        if (indice !== -1){
            if (this.contenido[indice].cantidad >= cantidad){
                this.contenido[indice].cantidad -= cantidad;
                if (this.contenido[indice].cantidad == 0){
                    this.contenido.splice(indice,1)
                }
                producto.stock += cantidad;
                await this.productos.actualizar(producto);
                return true
            }
            else return false;
        }
        else return false;
    }

    
    existeProducto(producto){
        let productoEncontrado = this.contenido.findIndex(productoEnCarrito => productoEnCarrito.producto.id === producto.id);
        return productoEncontrado;
    }

    async devolverProductos(){
        for (const item of this.contenido){
            item.producto.stock += item.cantidad;
            await this.productos.actualizar(item.producto);
        }
        this.vaciar();
    }

    vaciar(){
        this.contenido = null;
    }

    cargar(){
        return this.contenido;
    }
    
    numProductos(){
        return this.contenido.length;
    }

    
}

export default Carro