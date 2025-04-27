import express from 'express'; 
import Validaciones from '../classes/Validaciones.js';
import { generarToken, generarTokenVerificacion, verificarToken } from '../controllers/auth.js';
import nodemailer from 'nodemailer';
import Cliente from '../classes/Cliente.js';
import Clientes from '../classes/Clientes.js';

const router = express.Router();

async function  enviarVerificacion(email, password){
    const token = generarTokenVerificacion(email, password);
    const enlaceVerificacion = `http://localhost:3001/clientes/verificar?token=${token}`;

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
        from: 'vcapost23@gmail.com',
        to: email,
        subject: 'Verificación de cuenta',
        html: `
            <p>Haz clic en el botón para verificar tu cuenta:</p>
            <a href="${enlaceVerificacion}" style="
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
            ">Verificar Cuenta</a>
            `,
 
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
            res.status(200).json({mensaje:"Pulse en el link que se le ha enviado al correo para completar el registro"})
            enviarVerificacion(email, password);
            
        }
        else {
            res.status(401).json({error:'El email ya está registrado. Diríjase a la página de login'});
        }
    }


});

router.get('/verificar', async (req, res) => {
    const { token, email } = req.query;
    let verificado = false;
  
    const clientes = new Clientes();
    await clientes.conectar();
  
    // Si existe un token, verifica si es válido
    if (token) {
      const resultado = verificarToken(token);
      if (resultado.exito) {
        const datos = resultado.datos;
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



export default router;