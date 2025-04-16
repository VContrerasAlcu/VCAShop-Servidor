import validator from 'validator';

class Validaciones{

    static validarEmail(email){
        if (!email || validator.isEmpty(email.trim())) return 'Email obligatorio';
        else if (!validator.isEmail(email.trim())) return 'Email no válido';
             else return true;
    }

    static validarPassword(password){
        if (!password || validator.isEmpty(password.trim())) return 'Contraseña obligatoria';
        else if (!validator.isLength(password.trim(), {min: 4, max: 20})) return 'Mínimo 4 caracteres y máximo 20';
             else return true;

    }

    static validarNombre(nombre){
        if (!nombre || validator.isEmpty(nombre.trim())) return 'Nombre obligatorio';
        else if (!validator.isLength(nombre.trim(), {min: 2, max: 20})) return 'Mínimo 2 caracteres y máximo 50';
             else return true;

    }

    static validarDireccion(direccion){
        if (!nombre || validator.isEmpty(direccion.trim())) return 'Nombre obligatorio';
        else if (!validator.isLength(nombre.trim(), {min: 15, max: 20})) return 'Mínimo 2 caracteres y máximo 50';
             else return true;
    }

    static validarTelefono(telefono){
        if (!telefono || validator.isEmpty(telefono.trim())) return 'Teléfono obligatorio';
        else if (!validator.isNumeric(telefono.trim())) return 'Formato incorrecto';
             else return true;
    }


    static validarDescripcion(descripcion){
        if (!descripcion || validator.isEmpty(descripcion.trim())) return 'Descripción obligatoria';
        else return true;
    }

    static validarPrecio(precio){
        if (!precio || validator.isEmpty(precio.toString().trim())) return 'Precio obligatorio';
        else if (!validator.isNumeric(precio.toString())) return 'Formato incorrecto';
             else{
                precioNumero = parseFloat(precio);
                if (precioNumero<=0) return 'El precio debe ser mayor que 0';
                else return true;
             } 
    }

    static validarStock(stock){
        if (!stock || validator.isEmpty(stock.toString().trim())) return 'Stock obligatorio';
        else if (!validator.isNumeric(stock.toString())) return 'Formato incorrecto';
             else{
                stockNumero = parseInt(stock);
                if (stockNumero<=0) return 'El stock debe ser mayor que 0';
                else return true;
             } 
    }

    static validarImagen(urlImagen){
        if (!urlImagen || validator.isEmpty(urlImagen.trim())) return 'Imagen Obligatoria';
        else if (!validator.isURL(urlImagen.trim()));
             else return true;
    }

    static validarCategoria(categoria){
        if (!categoria || validator.isEmpty(categoria.trim())) return 'Categoría obligatoria';
        else return true;
    }


}