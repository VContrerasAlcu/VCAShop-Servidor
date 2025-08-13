import validator from 'validator';

/**
 * Clase Validaciones
 * Contiene métodos estáticos para validar distintos campos del sistema.
 */
class Validaciones {
    /**
     * Valida un email.
     * @param {string} email
     * @returns {true|string} True si es válido, o mensaje de error.
     */
    static validarEmail(email) {
        if (!email || validator.isEmpty(email.trim())) return 'Email obligatorio';
        if (!validator.isEmail(email.trim())) return 'Email no válido';
        return true;
    }

    /**
     * Valida una contraseña.
     * @param {string} password
     * @returns {true|string}
     */
    static validarPassword(password) {
        if (!password || validator.isEmpty(password.trim())) return 'Contraseña obligatoria';
        if (!validator.isLength(password.trim(), { min: 4, max: 20 })) return 'Mínimo 4 caracteres y máximo 20';
        return true;
    }

    /**
     * Valida un nombre.
     * @param {string} nombre
     * @returns {true|string}
     */
    static validarNombre(nombre) {
        if (!nombre || validator.isEmpty(nombre.trim())) return 'Nombre obligatorio';
        if (!validator.isLength(nombre.trim(), { min: 2, max: 50 })) return 'Mínimo 2 caracteres y máximo 50';
        return true;
    }

    /**
     * Valida una dirección.
     * @param {string} direccion
     * @returns {true|string}
     */
    static validarDireccion(direccion) {
        if (!direccion || validator.isEmpty(direccion.trim())) return 'Dirección obligatoria';
        if (!validator.isLength(direccion.trim(), { min: 5, max: 100 })) return 'Debe tener entre 5 y 100 caracteres';
        return true;
    }

    /**
     * Valida un número de teléfono.
     * @param {string} telefono
     * @returns {true|string}
     */
    static validarTelefono(telefono) {
        if (!telefono || validator.isEmpty(telefono.trim())) return 'Teléfono obligatorio';
        if (!validator.isNumeric(telefono.trim())) return 'Formato incorrecto';
        return true;
    }

    /**
     * Valida una descripción.
     * @param {string} descripcion
     * @returns {true|string}
     */
    static validarDescripcion(descripcion) {
        if (!descripcion || validator.isEmpty(descripcion.trim())) return 'Descripción obligatoria';
        return true;
    }

    /**
     * Valida un precio.
     * @param {number|string} precio
     * @returns {true|string}
     */
    static validarPrecio(precio) {
        const texto = precio?.toString().trim();
        if (!texto || validator.isEmpty(texto)) return 'Precio obligatorio';
        if (!validator.isNumeric(texto)) return 'Formato incorrecto';

        const precioNumero = parseFloat(precio);
        if (precioNumero <= 0) return 'El precio debe ser mayor que 0';
        return true;
    }

    /**
     * Valida el stock.
     * @param {number|string} stock
     * @returns {true|string}
     */
    static validarStock(stock) {
        const texto = stock?.toString().trim();
        if (!texto || validator.isEmpty(texto)) return 'Stock obligatorio';
        if (!validator.isNumeric(texto)) return 'Formato incorrecto';

        const stockNumero = parseInt(stock);
        if (stockNumero <= 0) return 'El stock debe ser mayor que 0';
        return true;
    }

    /**
     * Valida una URL de imagen.
     * @param {string} urlImagen
     * @returns {true|string}
     */
    static validarImagen(urlImagen) {
        if (!urlImagen || validator.isEmpty(urlImagen.trim())) return 'Imagen obligatoria';
        if (!validator.isURL(urlImagen.trim())) return 'URL de imagen no válida';
        return true;
    }

    /**
     * Valida una categoría.
     * @param {string} categoria
     * @returns {true|string}
     */
    static validarCategoria(categoria) {
        if (!categoria || validator.isEmpty(categoria.trim())) return 'Categoría obligatoria';
        return true;
    }
}

export default Validaciones;