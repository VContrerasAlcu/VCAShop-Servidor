/**
 * Clase Producto
 * Representa un producto disponible en la tienda, con sus detalles y stock.
 */
class Producto {
    /**
     * Crea una instancia de Producto.
     * @param {number} id - Identificador único del producto.
     * @param {string} nombre - Nombre del producto.
     * @param {string} descripcion - Descripción del producto.
     * @param {number} precio - Precio del producto.
     * @param {number} stock - Cantidad disponible en inventario.
     * @param {string} imagen - Ruta o URL de la imagen del producto.
     * @param {string} categoria - Categoría del producto.
     * @param {boolean} [destacado=false] - Indica si el producto está destacado.
     */
    constructor(id, nombre, descripcion, precio, stock, imagen, categoria, destacado = false) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.imagen = imagen;
        this.categoria = categoria;
        this.destacado = destacado;
    }

    /**
     * Modifica el stock del producto.
     * @param {number} stock - Nueva cantidad disponible.
     */
    modificarStock(stock) {
        this.stock = stock;
    }
}

export default Producto;