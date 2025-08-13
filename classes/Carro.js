import Productos from './Productos.js';

/**
 * Clase Carro
 * Representa un carrito de compras que permite agregar, quitar y devolver productos,
 * manteniendo actualizado el stock en la base de datos.
 */
class Carro {
    /**
     * Crea una instancia del carrito.
     * @param {Array} contenido - Lista inicial de productos en el carrito.
     */
    constructor(contenido = []) {
        this.contenido = contenido; // Cada elemento tiene { producto, cantidad }
        this.productos = new Productos(); // Para consultar y actualizar stock
    }

    /**
     * Agrega un producto al carrito si hay suficiente stock.
     * Si el producto ya está en el carrito, actualiza la cantidad.
     * @param {object} producto - El producto que se quiere agregar.
     * @param {number} cantidad - La cantidad deseada.
     * @returns {Promise<object|boolean>} El producto actualizado o false si no hay stock suficiente.
     */
    async agregar(producto, cantidad) {
        await this.productos.conectar();
        const stock = await this.productos.consultarStock(producto);
        console.log(`Stock del producto ${producto.nombre}: ${stock}`);

        if (cantidad <= stock) {
            const indice = this.existeProducto(producto);

            if (indice !== -1) {
                // Ya existe en el carrito, actualizamos cantidad
                const cantidadActual = this.contenido[indice].cantidad;
                const diferencia = cantidad - cantidadActual;
                this.contenido[indice].cantidad = cantidad;
                producto.stock -= diferencia;
                this.contenido[indice].producto = producto;
            } else {
                // Producto nuevo en el carrito
                console.log(`Antes del push`);
                this.contenido.push({ producto, cantidad });
                producto.stock -= cantidad;
            }

            await this.productos.actualizar(producto);
            await this.productos.desconectar();
            return producto;
        } else {
            console.log('Pedido superior al stock disponible');
            await this.productos.desconectar();
            return false;
        }
    }

    /**
     * Quita un producto del carrito y devuelve el stock al inventario.
     * @param {object} producto - El producto que se quiere quitar.
     * @returns {Promise<boolean>} True si se quitó, false si no estaba en el carrito.
     */
    async quitar(producto) {
        await this.productos.conectar();
        const indice = this.existeProducto(producto);

        if (indice !== -1) {
            producto.stock += this.contenido[indice].cantidad;
            this.contenido.splice(indice, 1);
            await this.productos.actualizar(producto);
            await this.productos.desconectar();
            return true;
        } else {
            await this.productos.desconectar();
            return false;
        }
    }

    /**
     * Verifica si un producto ya está en el carrito.
     * @param {object} producto - El producto a buscar.
     * @returns {number} Índice del producto en el carrito o -1 si no está.
     */
    existeProducto(producto) {
        return this.contenido.findIndex(item => item.producto.id === producto.id);
    }

    /**
     * Devuelve todos los productos del carrito al inventario.
     * Limpia el carrito después de actualizar el stock.
     * @returns {Promise<void>}
     */
    async devolverProductos() {
        await this.productos.conectar();
        for (const item of this.contenido) {
            item.producto.stock += item.cantidad;
            await this.productos.actualizar(item.producto);
        }
        await this.productos.desconectar();
        this.vaciar();
    }

    /**
     * Vacía el carrito por completo.
     */
    vaciar() {
        this.contenido = [];
    }

    /**
     * Muestra el contenido actual del carrito.
     * @returns {Array} Lista de productos en el carrito.
     */
    cargar() {
        console.log("Contenido del carro:", this.contenido);
        return this.contenido.length > 0 ? this.contenido : [];
    }

    /**
     * Devuelve el número de productos distintos en el carrito.
     * @returns {number}
     */
    numProductos() {
        return this.contenido.length;
    }
}

export default Carro;