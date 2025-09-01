import express from 'express';
import Validaciones from '../classes/Validaciones.js';
import { generarToken, verificarToken } from '../controllers/auth.js';
import nodemailer from 'nodemailer';
import Cliente from '../classes/Cliente.js';
import Clientes from '../classes/Clientes.js';

const router = express.Router();
const codigosVerificacion = {}; // Almacena códigos temporales para verificación y recuperación

/**
 * Función auxiliar para enviar correos de verificación
 * @param {string} email - Correo del destinatario
 * @param {string} codigo - Código de verificación
 */
async function enviarVerificacion(email, codigo) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vcapost23@gmail.com',
            pass: 'ndrvrxlnmmnquxmw',
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const opciones = {
        from: '"VCA shop" <vcapost23@gmail.com>',
        to: email,
        subject: 'Verificación de cuenta',
        html: `<p>Introduce el siguiente código para completar la acción: ${codigo}</p>`,
    };

    await transporter.sendMail(opciones);
}

/**
 * Endpoint POST /login
 * Autentica al cliente con email y contraseña.
 * Si es válido, genera un token y lo devuelve junto con los datos del cliente.
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = await clientes.buscar(email);

    if (!cliente || password !== cliente.password) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(cliente);
    cliente.autorizar(token);
    res.json({ cliente });
});

/**
 * Endpoint POST /login-google
 * Autenticación mediante cuenta de Google.
 * Si el cliente no existe, lo crea automáticamente.
 */
router.post("/login-google", async (req, res) => {
    const { googleData } = req.body;

    if (!googleData || !googleData.email) {
        return res.status(400).json({ error: "Datos inválidos de Google." });
    }

    try {
        const clientes = new Clientes();
        await clientes.conectar();
        let cliente = await clientes.buscar(googleData.email);

        if (!cliente) {
            cliente = new Cliente(googleData.email, "user", googleData.name);
            await clientes.insertar(cliente);
        }

        const token = generarToken(cliente);
        cliente.autorizar(token);
        res.json({ cliente });
    } catch (err) {
        res.status(500).json({ error: "Error al acceder al sistema." });
    }
});

/**
 * Endpoint POST /registro
 * Inicia el proceso de registro de un nuevo cliente.
 * Valida el email y envía un código de verificación si no está registrado.
 */
router.post('/registro', async (req, res) => {
    const { email, password } = req.body;
    const emailValido = Validaciones.validarEmail(email);
    const clientes = new Clientes();
    await clientes.conectar();

    if (!emailValido) {
        return res.status(400).json({ error: 'Email no válido' });
    }

    const encontrado = await clientes.buscar(email);
    if (!encontrado) {
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigosVerificacion[email] = {
            codigo,
            password,
            expires: Date.now() + 5 * 60 * 1000
        };
        enviarVerificacion(email, codigo);
        res.json({ mensaje: "Código enviado al correo." });
    } else {
        res.status(401).json({ error: 'El email ya está registrado. Diríjase a la página de login' });
    }
});

/**
 * Endpoint POST /verificar-codigo
 * Verifica el código enviado por correo y completa el registro del cliente.
 */
router.post("/verificar-codigo", async (req, res) => {
    const { email, codigo } = req.body;
    const registro = codigosVerificacion[email];

    if (!registro) {
        return res.status(400).json({ error: "No se encontró el correo." });
    }

    if (Date.now() > registro.expires) {
        delete codigosVerificacion[email];
        return res.status(400).json({ error: "Código expirado." });
    }

    if (registro.codigo !== codigo) {
        return res.status(401).json({ error: "Código incorrecto." });
    }

    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = new Cliente(email, registro.password);
    await clientes.insertar(cliente);
    delete codigosVerificacion[email];

    res.json({ mensaje: "Cliente registrado correctamente." });
});

/**
 * Endpoint GET /verificar
 * Verifica si el cliente está registrado o si el token es válido.
 * Puede usarse para confirmar el estado de verificación.
 */
router.get('/verificar', async (req, res) => {
    const { email } = req.query;
    let verificado = false;

    const clientes = new Clientes();
    await clientes.conectar();

    if (token) {
        const resultado = verificarToken(token);
        if (resultado.exito) {
            const datos = resultado.datos;
            const cliente = new Cliente(datos.email, datos.password);
            await clientes.insertar(cliente);
            verificado = true;
            return res.json({ email: datos.email, verificado });
        } else {
            res.redirect('http://localhost:3000/registroError');
            return;
        }
    }

    if (email) {
        const cliente = await clientes.buscar(email);
        if (cliente) {
            verificado = true;
        }
        res.json({ email, verificado });
    }
});

/**
 * Endpoint POST /recuperar
 * Inicia el proceso de recuperación de contraseña.
 * Envía un código al correo si el cliente existe.
 */
router.post('/recuperar', async (req, res) => {
    const { email } = req.body;
    const emailValido = Validaciones.validarEmail(email);
    const clientes = new Clientes();
    await clientes.conectar();

    if (!emailValido) {
        return res.status(400).json({ error: 'Email no válido' });
    }

    const encontrado = await clientes.buscar(email);
    if (encontrado) {
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigosVerificacion[email] = {
            codigo,
            expires: Date.now() + 5 * 60 * 1000
        };
        enviarVerificacion(email, codigo);
        res.status(200).json({ mensaje: 'Código enviado al correo para recuperar contraseña' });
    } else {
        res.status(400).json({ error: 'El email no está registrado. Revisa el email o dirígete a la página de registro' });
    }
});

/**
 * Endpoint POST /verificar-recuperacion
 * Verifica el código de recuperación y actualiza la contraseña del cliente.
 */
router.post('/verificar-recuperacion', async (req, res) => {
    const { email, codigo, nuevaPassword } = req.body;
    const registro = codigosVerificacion[email];

    if (!registro) {
        return res.status(400).json({ error: "Solicitud inválida." });
    }

    if (Date.now() > registro.expires) {
        delete codigosVerificacion[email];
        return res.status(400).json({ error: "Código expirado." });
    }

    if (registro.codigo !== codigo) {
        return res.status(401).json({ error: "Código incorrecto." });
    }

    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = await clientes.buscar(email);

    if (!cliente) {
        res.status(400).json({ error: 'Cliente no encontrado' });
    } else {
        cliente.password = nuevaPassword;
        await clientes.actualizar(cliente);
        delete codigosVerificacion[email];
        res.json({ mensaje: "Contraseña actualizada correctamente." });
    }
});

/**
 * Endpoint POST /actualizarDatos
 * Actualiza los datos del cliente en la base de datos.
 */
router.post('/actualizarDatos', async (req, res) => {
    const clienteRecibido = req.body;
    const clientes = new Clientes();
    await clientes.conectar();
    const result = await clientes.actualizar(clienteRecibido);

    if (result) {
        res.status(200).send('Cliente actualizado correctamente');
    } else {
        res.status(400).send('Error al actualizar el cliente.');
    }
});

export default router;