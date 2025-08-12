// servicios/LimpiezaCarros.js

import Carro from "../classes/Carro.js";
import Carros from "../classes/Carros.js";



export async function eliminarCarrosAntiguos() {
    const carros = new Carros();
    const horas = 48;
    await carros.conectar();
    try{
        const resultados = await carros.revisarFechaCarros(horas);
        for (const fila of resultados) {
            const { email, carro } = fila;

            // reconstruir el carro desde la base de datos
            const carroReconstruido = new Carro();

            for (const item of carro) {
                carroReconstruido.contenido.push({
                producto: item.producto,
                cantidad: item.cantidad
                });
            }

            // devolver productos al stock
            await carroReconstruido.devolverProductos();

            // vaciar el carro en la base de datos
            await carros.vaciar(email);

            console.log(`🧹 Carro de ${email} limpiado y productos devueltos`);
        }
    } catch (error) {
        console.error('❌ Error al eliminar carros antiguos:', error);
    } finally {
        await carros.desconectar();
  }
}