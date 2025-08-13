/**
 * Clase Cliente
 * Representa a un usuario del sistema con sus datos personales y estado de autorización.
 */
class Cliente {
    token = null;

    /**
     * Crea una instancia de Cliente.
     * @param {string} email - Correo electrónico del cliente.
     * @param {string} password - Contraseña del cliente.
     * @param {string|null} nombre - Nombre del cliente (opcional).
     * @param {string|null} direccion - Dirección del cliente (opcional).
     * @param {string|null} telefono - Teléfono del cliente (opcional).
     */
    constructor(email, password, nombre = null, direccion = null, telefono = null) {
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
    }

    /**
     * Autoriza al cliente asignándole un token.
     * @param {string} token - Token de sesión o autenticación.
     */
    autorizar(token) {
        this.token = token;
    }

    /**
     * Desautoriza al cliente eliminando su token.
     */
    desautorizar() {
        this.token = null;
    }
}

export default Cliente;