import express from 'express'; 
import Validaciones from '../classes/Validaciones.js';
import { generarToken, generarTokenVerificacion, verificarToken } from '../controllers/auth.js';
import nodemailer from 'nodemailer';
import Cliente from '../classes/Cliente.js';
import Clientes from '../classes/Clientes.js';

const router = express.Router();

async function  enviarVerificacion(email, token, opcion){
    let enlaceVerificacion = '';
    console.log(`estoy en enviarVerificacion. email: ${email}`);
    if (opcion == 'registro'){
        enlaceVerificacion = `http://localhost:3001/clientes/verificar?token=${token}`;
    }
    else {
        enlaceVerificacion = `http://localhost:3001/clientes/verificarPass?token=${token}`;
    }

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
            const opcion = 'registro';
            const token = generarTokenVerificacion(email,password);
            enviarVerificacion(email, token, opcion);
            
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

router.get('/verificarPass', async (req, res) => {
    const { token } = req.query;
    let verificado = false;

    const clientes = new Clientes();
    await clientes.conectar();
    const resultado = verificarToken(token);
    if (resultado.exito) {
        console.log('token verificado');
        verificado = true;
        const emailToken = resultado.datos.email;
        req.io.to(emailToken).emit('linked', {verificado,token});
    }
    else {
        verificado = false;
        const error = 'token no válido';
        req.io.emit('linked',{verificado, error});
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
            console.log(encontrado.email, encontrado.password);
            const token = generarToken(encontrado);
            res.status(200).json({token: token, mensaje:"Pulse en el link que se le ha enviado al correo para completar el registro"})
            const opcion = 'recuperacion';
            enviarVerificacion(encontrado.email, token, opcion);
            
        }
        else {
            res.status(400).json({error:'El email no está registrado. Revisa el email o dirígete a la página de registro'});
        }
    }


});

router.post('/cambiarPass', async (req, res) => {
    const {token, nuevaPass} = req.body;
    const resultado = verificarToken(token);
    if (resultado.exito){
        const clientes = new Clientes();
        await clientes.conectar();
        const cliente = await clientes.buscar(resultado.datos.email);
        if (!cliente){
            res.status(400).json({error: 'Cliente no encontrado'});
        }
        else{
            console.log('la nueva pass es: ', nuevaPass);
            cliente.password = nuevaPass;
            console.log(cliente);
            const result = await clientes.actualizar(cliente);
            res.status(200).json({token: token, mensaje:'Contraseña modificada. Vaya a la página de login.'});
        }
    }
})

export default router;

