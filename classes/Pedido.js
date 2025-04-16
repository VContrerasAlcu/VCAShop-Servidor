
class Pedido{
    constructor(cliente, producto, cantidad, direccionenvio){
        this.cliente_email = cliente.email;
        this.producto_id = producto.id;
        this.cantidad = cantidad;
        this.fecha_pedido = new Date();
        this.estado = 'pendiente';
        this.direccionenvio = direccionenvio;

    }

    cambiarEstado(estado){
        this.estado = estado;
    }
}

export default Pedido;
