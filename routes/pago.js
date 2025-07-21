import express from "express";
import RedsysAPI from "redsys-api";
import Compra from "../classes/Compra.js";
import Compras from "../classes/Compras.js";
import Carros from "../classes/Carros.js";

const router = express.Router();
const redsys = new RedsysAPI();

// Datos de pruebas de Redsys
const clavePruebas = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
const fuc = "999008881";
const terminal = "1";

router.post("/generarPago", async (req, res) => {
  const { cliente, carro, total } = req.body;
  console.log(`📨 Recibido en generar pago el nombre: ${cliente.nombre}`);

  const amount = Math.round(total * 100);
  const codigoredsys = String(Date.now()).slice(-12).padStart(12, "0");
  console.log("💶 Total recibido:", total);
  console.log("💶 amount final enviado:", amount);
  // Crear y guardar compra
  let compra = new Compra(codigoredsys, cliente.email, carro, total, new Date());
  const codigoredsysGenerado = compra.codigoredsys;
  console.log("📦 Código en BBDD:", codigoredsysGenerado);
  const compras = new Compras();
  await compras.conectar();
  await compras.agregarCompra(compra);
  console.log('Compra insertada.');

  // Parámetros aceptados por Redsys (sin campos no estándar)
  /*const merchantParams = {
    DS_MERCHANT_AMOUNT: amount.toString(),
    DS_MERCHANT_ORDER: codigoredsys,
    DS_MERCHANT_MERCHANTCODE: fuc,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_TRANSACTIONTYPE: "0",
    DS_MERCHANT_TERMINAL: terminal,
    DS_MERCHANT_MERCHANTURL: "http://localhost:3001/respuesta-pago",
    DS_MERCHANT_URLOK: "http://localhost:3000/pagoOk",
    DS_MERCHANT_URLKO: "http://localhost:3000/pagoError"
    //DS_MERCHANT_PRODUCTDESCRIPTION: "Compra online"
  };*/
  redsys.setParameter('DS_MERCHANT_AMOUNT', amount);
  redsys.setParameter('DS_MERCHANT_ORDER', codigoredsys);
  redsys.setParameter('DS_MERCHANT_MERCHANTCODE', fuc);
  redsys.setParameter('DS_MERCHANT_CURRENCY', '978');
  redsys.setParameter('DS_MERCHANT_TRANSACTIONTYPE', '0');
  redsys.setParameter('DS_MERCHANT_TERMINAL', terminal);
  redsys.setParameter('DS_MERCHANT_MERCHANTURL', "https://d885295c3486.ngrok-free.app/pago/respuesta-pago");
  redsys.setParameter('DS_MERCHANT_URLOK', "http://localhost:3000/pagoOk");
  redsys.setParameter('DS_MERCHANT_URLKO', "http://localhost:3000/pagoError");
  redsys.setParameter('DS_MERCHANT_CONSUMERLANGUAGE', '002');
  redsys.setParameter('DS_MERCHANT_PRODUCTDESCRIPTION', 'Compra online');

  /*console.log("🧪 merchantParams:", merchantParams);
  console.log("📏 Longitud ORDER:", merchantParams.DS_MERCHANT_ORDER.length);*/

  try {
    const paramsBase64 = redsys.createMerchantParameters();
    if (!paramsBase64) throw new Error("Parámetros codificados inválidos");

    const firma = redsys.createMerchantSignature(clavePruebas);
    if (!firma) throw new Error("Firma no generada");

    console.log("📦 Params Base64:", paramsBase64);
    console.log("🧾 Firma generada:", firma);
    console.log("🔐 Clave usada:", clavePruebas);
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

router.post("/respuesta-pago", express.urlencoded({ extended: true }), async (req, res) => {
  const { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } = req.body;

  const firmaEsperada = redsys.checkMerchantSignatureNotif(
    clavePruebas,
    Ds_MerchantParameters,
    Ds_Signature
  );

  

  if (!firmaEsperada) {
    console.warn("Firma inválida — posible intento de manipulación.");
    return res.status(400).send("Firma inválida");
  }

  const datos = redsys.decodeMerchantParameters(Ds_MerchantParameters);
  console.log("✅ Notificación Redsys recibida:", datos);

  if (datos.Ds_Response >= 0 && datos.Ds_Response <= 99) {
    const codigoredsys = String(datos.Ds_Order);
    console.log(`Contenido de la variable codigoredsys: ${codigoredsys}`);
    const compras = new Compras();
    await compras.conectar();


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
        await new Promise(resolver => setTimeout(resolver, 1000)); // Espera 0.5 segundos
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
    
    
    //const compra = await compras.compra(codigoredsys);
    console.log("resultado de busqueda de compra: ", compra);
    compra.confirmar();
    const result = await compras.actualizarCompra(compra);
    if (result){
        console.log("💰 Pago correcto. Estado de compra cambiada a confirmada");
        
        const carros = new Carros();
        await carros.conectar();
        const carroActualizado = carros.vaciar(compra.email);
        if (carroActualizado) {
          console.log(`Carro de cliente actualizado`);
          res.status(200).send("OK");
        }
        else {
          console.log(`Error, no se ha podido actualizar el carro del cliente`);
          res.status(400).send("Actualización de carro de cliente fallida");
        }


    }
    else{
      console.log(`No se ha podido actualizar el estado de la compra`);
      res.status(400).send("Actualización de estado de compra fallida");

    }  
  }
  else {
    console.log("❌ Pago fallido. No se guarda el pedido.");
    res.status(400).send("Pago fallido");
  }
});

export default router;