class Compra{
    codigoredsys;
    email;
    carro;
    total;
    fecha;
    estado;


    constructor(codigoredsys,email,carro,total,fecha,estado = 'pendiente'){
        this.codigoredsys = codigoredsys;
        this.email = email;
        this.carro = carro;
        this.total = total;
        this.fecha = fecha;
        this.estado = estado;

    }

    confirmar(){
        this.estado = 'finalizada';
    }



    carro(){
        return this.carro;
    }


}

export default Compra