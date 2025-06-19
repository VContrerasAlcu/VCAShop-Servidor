import Productos from './Productos.js';
class Carro{
    

    constructor(contenido = []){
        this.contenido = contenido;
        this.productos = new Productos();
        
    }

    async agregar(producto, cantidad){
        await this.productos.conectar();
        const stock = await this.productos.consultarStock(producto);
        console.log(`stock del producto: ${producto.nombre}: ${stock}`);
        if (cantidad <= stock){
            const indice = this.existeProducto(producto);
            if (indice !== -1){
                const cantidadActual = this.contenido[indice].cantidad;
                const diferencia = cantidad - cantidadActual;
                this.contenido[indice].cantidad = cantidad;
                producto.stock -= diferencia;
                this.contenido[indice].producto = producto;
                
            }
            else {
                console.log(`Antes del push`);
                this.contenido.push({producto, cantidad});
                producto.stock -= cantidad;
                
            }
            
            await this.productos.actualizar(producto);
            await this.productos.desconectar();
            return producto;

        }
        else {
            console.log('Pedido superior a stock disponible');
            await this.productos.desconectar();
            return false;
        } 
    
    }

    async quitar(producto){
        await this.productos.conectar();
        const indice = this.existeProducto(producto);
        if (indice !== -1){
            producto.stock += this.contenido[indice].cantidad;
            this.contenido.splice(indice,1);
            await this.productos.actualizar(producto);
            await this.productos.desconectar();
            return true;
        }
         
        else {
            await this.productos.desconectar();
            return false;
        }
        
    }

    
    existeProducto(producto){
            let productoEncontrado = this.contenido.findIndex(productoEnCarrito => productoEnCarrito.producto.id === producto.id);
            return productoEncontrado;
        
    }

    async devolverProductos(){
        await this.productos.conectar();
        for (const item of this.contenido){
            item.producto.stock += item.cantidad;
            await this.productos.actualizar(item.producto);
        }
        await this.productos.desconectar();
        this.vaciar();
    }

    vaciar(){
        this.contenido = [];
    }

   cargar() {
    console.log("Contenido del carro:", this.contenido);
    return this.contenido.length > 0 ? this.contenido : [];
    }   

    
    numProductos(){
        return this.contenido.length;
    }

    
}

export default Carro