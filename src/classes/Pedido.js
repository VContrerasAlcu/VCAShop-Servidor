
class Pedido{
    constructor(cliente_email,producto_id,cantidad,fecha_pedido,estado,direccionenvio){
        this.cliente_email = cliente_email;
        this.producto_id = producto_id;
        this.cantidad = cantidad;
        this.fecha_pedido = fecha_pedido;
        this.estado = estado;
        this.direccionenvio = direccionenvio;
    }
}

export default Pedido;
