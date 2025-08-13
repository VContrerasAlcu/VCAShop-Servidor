// Importación de módulos necesarios
import express from "express"; // Framework para crear rutas HTTP
import RedsysAPI from "redsys-api"; // Librería para interactuar con Redsys
import Compra from "../classes/Compra.js"; // Clase que representa una compra individual
import Compras from "../classes/Compras.js"; // Clase para gestionar múltiples compras
import Carros from "../classes/Carros.js"; // Clase para gestionar el carrito de compras

// Inicialización del router y Redsys
const router = express.Router();
const redsys = new RedsysAPI();

// Datos de pruebas proporcionados por Redsys
const clavePruebas = "sq7HjrUOBfKmC576ILgskD5srU870gJ7"; // Clave secreta para firmar
const fuc = "999008881"; // Código de comercio de pruebas
const terminal = "1"; // Número de terminal

// Ruta para generar el pago
router.post("/generarPago", async (req, res) => {
  const { cliente, carro, total } = req.body; // Extraer datos del cuerpo de la petición
  console.log(`📨 Recibido en generar pago el nombre: ${cliente.nombre}`);

  const amount = Math.round(total * 100); // Redsys requiere el importe en céntimos
  const codigoredsys = String(Date.now()).slice(-12).padStart(12, "0"); // Generar código único para la compra

  console.log("💶 Total recibido:", total);
  console.log("💶 amount final enviado:", amount);

  // Crear objeto Compra y guardarlo en la base de datos
  let compra = new Compra(codigoredsys, cliente.email, carro, total, new Date());
  const codigoredsysGenerado = compra.codigoredsys;
  console.log("📦 Código en BBDD:", codigoredsysGenerado);

  const compras = new Compras();
  await compras.conectar();
  await compras.agregarCompra(compra);
  console.log('Compra insertada.');

  // Configurar parámetros requeridos por Redsys
  redsys.setParameter('DS_MERCHANT_AMOUNT', amount); // Importe en céntimos
  redsys.setParameter('DS_MERCHANT_ORDER', codigoredsys); // Código de pedido
  redsys.setParameter('DS_MERCHANT_MERCHANTCODE', fuc); // Código de comercio
  redsys.setParameter('DS_MERCHANT_CURRENCY', '978'); // Moneda: Euro
  redsys.setParameter('DS_MERCHANT_TRANSACTIONTYPE', '0'); // Tipo de transacción: compra
  redsys.setParameter('DS_MERCHANT_TERMINAL', terminal); // Terminal
  redsys.setParameter('DS_MERCHANT_MERCHANTURL', "https://d885295c3486.ngrok-free.app/pago/respuesta-pago"); // URL de notificación
  redsys.setParameter('DS_MERCHANT_URLOK', "http://localhost:3000/pagoOk"); // Redirección si el pago es exitoso
  redsys.setParameter('DS_MERCHANT_URLKO', "http://localhost:3000/pagoError"); // Redirección si el pago falla
  redsys.setParameter('DS_MERCHANT_CONSUMERLANGUAGE', '002'); // Idioma: español
  redsys.setParameter('DS_MERCHANT_PRODUCTDESCRIPTION', 'Compra online'); // Descripción del producto

  try {
    // Codificar parámetros y generar firma
    const paramsBase64 = redsys.createMerchantParameters();
    if (!paramsBase64) throw new Error("Parámetros codificados inválidos");

    const firma = redsys.createMerchantSignature(clavePruebas);
    if (!firma) throw new Error("Firma no generada");

    console.log("📦 Params Base64:", paramsBase64);
    console.log("🧾 Firma generada:", firma);
    console.log("🔐 Clave usada:", clavePruebas);

    // Enviar respuesta con datos necesarios para Redsys
    res.json({
      version: "HMAC_SHA256_V1",
      params: paramsBase64,
      signature: firma,
      url: "https://sis-t.redsys.es:25443/sis/realizarPago"
    });
  } catch (error) {
    console.error("❌ Error generando pago:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para recibir la respuesta del pago
router.post("/respuesta-pago", express.urlencoded({ extended: true }), async (req, res) => {
  const { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } = req.body;

  // Verificar firma para evitar manipulaciones
  const firmaEsperada = redsys.checkMerchantSignatureNotif(
    clavePruebas,
    Ds_MerchantParameters,
    Ds_Signature
  );

  if (!firmaEsperada) {
    console.warn("Firma inválida — posible intento de manipulación.");
    return res.status(400).send("Firma inválida");
  }

  // Decodificar parámetros recibidos
  const datos = redsys.decodeMerchantParameters(Ds_MerchantParameters);
  console.log("✅ Notificación Redsys recibida:", datos);

  // Verificar si el pago fue exitoso
  if (datos.Ds_Response >= 0 && datos.Ds_Response <= 99) {
    const codigoredsys = String(datos.Ds_Order);
    console.log(`Contenido de la variable codigoredsys: ${codigoredsys}`);

    const compras = new Compras();
    await compras.conectar();

    // Intentar recuperar la compra hasta 5 veces (por si hay retraso en la inserción)
    const MAX_REINTENTOS = 5;
    let compra = await compras.compra(codigoredsys);
    console.log('resultado de compras.compra: ', compra);
    debugger;

    for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
      compra = await compras.compra(codigoredsys);
      if (compra) {
        console.log(`✅ Compra encontrada en el intento ${intento}`);
        break;
      } else {
        console.log(`⏳ Compra aún no encontrada (intento ${intento}). Esperando...`);
        await new Promise(resolver => setTimeout(resolver, 1000)); // Espera 1 segundo
      }
    }

    if (!compra) {
      console.warn("❌ No se encontró la compra tras varios intentos. Abortando.");
      return res.status(404).send("Compra no encontrada");
    }

    const existeCompra = await compras.existeCompra(codigoredsys);
    console.log("existe compra?: ", existeCompra);

    const codigoredsysRecibido = codigoredsys;
    console.log("🧾 Código Redsys recibido:", codigoredsysRecibido);

    console.log("resultado de busqueda de compra: ", compra);

    // Confirmar compra y actualizar estado
    compra.confirmar();
    const result = await compras.actualizarCompra(compra);

    if (result) {
      console.log("💰 Pago correcto. Estado de compra cambiada a confirmada");

      // Vaciar el carrito del cliente
      const carros = new Carros();
      await carros.conectar();
      const carroActualizado = carros.vaciar(compra.email);

      if (carroActualizado) {
        console.log(`Carro de cliente actualizado`);
        res.status(200).send("OK");
      } else {
        console.log(`Error, no se ha podido actualizar el carro del cliente`);
        res.status(400).send("Actualización de carro de cliente fallida");
      }
    } else {
      console.log(`No se ha podido actualizar el estado de la compra`);
      res.status(400).send("Actualización de estado de compra fallida");
    }
  } else {
    console.log("❌ Pago fallido. No se guarda el pedido.");
    res.status(400).send("Pago fallido");
  }
});

// Exportar el router para usarlo en la aplicación principal
export default router;