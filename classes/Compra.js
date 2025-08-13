/**
 * Clase Compra
 * Representa una compra realizada por un cliente, incluyendo el carrito, total, fecha y estado.
 */
class Compra {
    codigoredsys;
    email;
    carro;
    total;
    fecha;
    estado;

    /**
     * Crea una instancia de Compra.
     * @param {string} codigoredsys - Código de referencia del pago (por ejemplo, RedSys).
     * @param {string} email - Email del cliente que realizó la compra.
     * @param {Array} carro - Contenido del carrito en el momento de la compra.
     * @param {number} total - Importe total de la compra.
     * @param {string} fecha - Fecha de la compra.
     * @param {string} [estado='pendiente'] - Estado de la compra ('pendiente' o 'finalizada').
     */
    constructor(codigoredsys, email, carro, total, fecha, estado = 'pendiente') {
        this.codigoredsys = codigoredsys;
        this.email = email;
        this.carro = carro;
        this.total = total;
        this.fecha = fecha;
        this.estado = estado;
    }

    /**
     * Marca la compra como finalizada.
     */
    confirmar() {
        this.estado = 'finalizada';
    }

    /**
     * Devuelve el contenido del carrito asociado a la compra.
     * @returns {Array} Carrito de productos.
     */
    carro() {
        return this.carro;
    }
}

export default Compra;