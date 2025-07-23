import express from 'express'; 
import Validaciones from '../classes/Validaciones.js';
import { generarToken, generarTokenVerificacion, verificarToken } from '../controllers/auth.js';
import nodemailer from 'nodemailer';
import Cliente from '../classes/Cliente.js';
import Clientes from '../classes/Clientes.js';
import { ja } from '@faker-js/faker';

const router = express.Router();
const codigosVerificacion = {};

async function  enviarVerificacion(email, codigo){
  
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vcapost23@gmail.com',
            pass: 'iiuucrvtjsddjmta',
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
 
    }

    await transporter.sendMail(opciones);

}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;


    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = await clientes.buscar(email);

    //if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
    if (!cliente || password!=cliente.password) {
        
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(cliente);
    cliente.autorizar(token);    
    res.json({ cliente });
});

router.post("/login-google", async (req, res) => {
  const { googleData } = req.body;

  if (!googleData || !googleData.email) {
    console.log('no googleData');
    return res.status(400).json({ error: "Datos inválidos de Google." });
  }

  try {
    const clientes = new Clientes();
    await clientes.conectar();
    let cliente = await clientes.buscar(googleData.email);
    // Buscar si el cliente ya existe
    //let cliente = await buscarClientePorEmail(googleData.email);

    // Si no existe, crear cliente nuevo
    if (!cliente) {
      console.log('cliente no encontrado, intento de creacion');
      cliente = new Cliente(googleData.email,"user",googleData.name);      
      await clientes.insertar(cliente);
    }

    const token = generarToken(cliente);
    cliente.autorizar(token);    
    res.json({ cliente });
  } catch (err) {
    console.error("Error en login con Google:", err);
    res.status(500).json({ error: "Error al acceder al sistema." });
  }
});





router.post('/registro', async (req,res) => {
    const {email,password} = req.body;
    const emailValido = Validaciones.validarEmail(email);
    const clientes = new Clientes();
    await clientes.conectar();
    if (emailValido!==true){
        return res.status(400).json({error: 'Email no válido'})
    }
    else {
        let encontrado = await clientes.buscar(email);
        if (!encontrado){
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();

            codigosVerificacion[email] = {
                codigo,
                password, // puedes encriptarlo si prefieres
                expires: Date.now() + 5 * 60 * 1000 // válido 5 minutos
            };
            enviarVerificacion(email, codigo);
            res.json({ mensaje: "Código enviado al correo." });


        }
        else {
            res.status(401).json({error:'El email ya está registrado. Diríjase a la página de login'});
        }
    }


});

router.post("/verificar-codigo", async (req, res) => {
    const { email, codigo } = req.body;

    const registro = codigosVerificacion[email];
    const pass = registro.password;

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
    await clientes.conectar()
    const cliente = new Cliente(email, pass);    
    // Inserta el cliente en la base de datos
    await clientes.insertar(cliente);

    delete codigosVerificacion[email];

    res.json({ mensaje: "Cliente registrado correctamente." });
});

router.get('/verificar', async (req, res) => {
    const {  email } = req.query;
    let verificado = false;

    const clientes = new Clientes();
    await clientes.conectar();

    // Si existe un token, verifica si es válido
    if (token) {
        const resultado = verificarToken(token);
        
        if (resultado.exito) {
            console.log('token exito en verificar');
            const datos = resultado.datos;
            console.log(`datos devueltos por verificarToken: ${resultado.datos}`);
            console.log(`email resultado de la verificacion: ${datos.email}`);

            const cliente = new Cliente(datos.email, datos.password);
    
            // Inserta el cliente en la base de datos
            await clientes.insertar(cliente);
            verificado = true;
    
            // Responde con el estado de verificación
            return res.json({ email: datos.email, verificado });
        } else {
            res.redirect('http://localhost:3000/registroError');
            return;
        }
    }

    // Si existe un email pero no un token, verifica si está registrado
    if (email) {
        const cliente = await clientes.buscar(email);
        if (cliente) {
            verificado = true; // Cambia el estado si el cliente está registrado
        }
        res.json({ email, verificado }); // Devuelve el estado
    }
});


router.post('/recuperar', async (req,res) => {
    const {email} = req.body;
    const emailValido = Validaciones.validarEmail(email);
    const clientes = new Clientes();
    await clientes.conectar();


    if (emailValido!==true){
        return res.status(400).json({error: 'Email no válido'})
    }
    else {
        const encontrado = await clientes.buscar(email);
        
        if (encontrado){
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            codigosVerificacion[email] = {
                codigo,
                expires: Date.now() + 5 * 60 * 1000
            }
            enviarVerificacion(email, codigo);
            res.status(200).json({mensaje: 'Código enviado al correo para recuperar contraseña'});
            
        }
        else {
            res.status(400).json({error:'El email no está registrado. Revisa el email o dirígete a la página de registro'});
        }
    }


});

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
    if (!cliente){
        res.status(400).json({error: 'Cliente no encontrado'});
    }
    else{
        cliente.password = nuevaPassword;
        const result = await clientes.actualizar(cliente);
        delete codigosVerificacion[email];
        res.json({ mensaje: "Contraseña actualizada correctamente." });
    }

});

router.post('/actualizarDatos', async (req, res) => {
    const clienteRecibido = req.body;
    const clientes = new Clientes();
    await clientes.conectar();
    const result = await clientes.actualizar(clienteRecibido);
    if (result) {
        res.status(200).send('Cliente actualizado correctamente');
    }
    else res.status(400).send('Error al actualizar el cliente.');

    
})

export default router;

