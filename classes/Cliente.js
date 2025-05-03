
class Cliente{
    token = null;
    constructor(email, password, nombre=null, direccion=null, telefono=null){
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
        
       
    }

    autorizar(token){
        this.token = token;
    }

    desautorizar(){
        this.token = null;
    }
}

export default Cliente;