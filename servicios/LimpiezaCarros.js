// Importación de clases necesarias
import Carro from "../classes/Carro.js"; // Clase que representa un carrito individual
import Carros from "../classes/Carros.js"; // Clase para gestionar múltiples carritos

/**
 * Función que elimina los carritos abandonados hace más de X horas.
 * - Reconstruye el contenido del carrito
 * - Devuelve los productos al stock
 * - Vacía el carrito en la base de datos
 */
export async function eliminarCarrosAntiguos() {
    const carros = new Carros(); // Instancia para acceder a los carritos
    const horas = 48; // Tiempo límite en horas para considerar un carrito como "antiguo"

    await carros.conectar(); // Conexión a la base de datos

    try {
        // Buscar carritos que no han sido modificados en las últimas X horas
        const resultados = await carros.revisarFechaCarros(horas);

        // Iterar sobre cada carrito encontrado
        for (const fila of resultados) {
            const { email, carro } = fila; // Extraer email y contenido del carrito

            // Reconstruir el carrito desde los datos obtenidos
            const carroReconstruido = new Carro();

            for (const item of carro) {
                carroReconstruido.contenido.push({
                    producto: item.producto,
                    cantidad: item.cantidad
                });
            }

            // Devolver los productos al stock
            await carroReconstruido.devolverProductos();

            // Vaciar el carrito en la base de datos
            await carros.vaciar(email);

            console.log(`🧹 Carro de ${email} limpiado y productos devueltos`);
        }
    } catch (error) {
        // Manejo de errores durante el proceso
        console.error('❌ Error al eliminar carros antiguos:', error);
    } finally {
        // Cierre de conexión a la base de datos
        await carros.desconectar();
    }
}