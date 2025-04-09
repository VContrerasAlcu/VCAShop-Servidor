

class Producto{
    constructor(nombre, descripcion, precio, stock, imagen, categoria){
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.imagen = imagen;
        this.categoria = categoria;
    }

    modificarStock(stock){
        this.stock = stock;
    }
}

export default Producto;