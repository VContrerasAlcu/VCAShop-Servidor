

class Producto{
    constructor(id, nombre, descripcion, precio, stock, imagen, categoria, destacado = false){
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.imagen = imagen;
        this.categoria = categoria;
        this.destacado = destacado;
    }

    modificarStock(stock){
        this.stock = stock;
    }
}

export default Producto;