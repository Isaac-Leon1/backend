import { sendMailToPerson } from "../config/nodemailer.js";
import mongoose from "mongoose";
import generarJWT from "../helpers/JWT.js";
import Usuarios from "../models/Ciudadano.js";
import Reportes from "../models/Reportes.js";
import {sendMailToRecoveryPassword} from "../config/nodemailer.js";
import Ciudadano from "../models/Ciudadano.js";

const registro = async (req,res)=>{
    const {
        nombre,
        apellido,
        email,
        password,
        telefono
    } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmail = await Usuarios.findOne({email})
    if(verificarEmail) return res.status(400).json({msg:"Lo sentimos, el email ya existe"})
    const usuario = new Usuarios({
        nombre,
        apellido,
        email,
        password,
        telefono
    })
    usuario.password = await usuario.encrypPassword(password)
    const token = usuario.crearToken()
    await usuario.save()
    sendMailToPerson(email,token)

    res.status(200).json({res:'Registro exitoso, verifica tu email para confirmar tu cuenta'})
}

const login = async (req,res)=>{
    // Actividad 1 (Request)
    // Obtener los datos del body
    const {
        email,
        password
    } = req.body

    // Actividad 2 (Validación)
    // Validar que los campos no estén vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    // Validar que el email exista en la base de datos
    const usuario = await Usuarios.findOne({email})
    if(!usuario) return res.status(400).json({msg:"Lo sentimos, el email no existe"})
    // Validar que la contraseña sea correcta
    const matchPassword = await usuario.matchPassword(password)
    if(!matchPassword) return res.status(400).json({msg:"Lo sentimos, la contraseña es incorrecta"})
    // Validar si el correo esta confirmado
    if(!usuario?.confirmEmail) return res.status(400).json({msg:"Lo sentimos, debes confirmar tu correo"})
    
    // Actividad 3 (Respuesta)
    // Crear un token
    const token = generarJWT(usuario._id,'ciudadano')
    const {nombre, apellido, email:correo, telefono} = usuario
    // Responder con el token
    res.status(200).json({
        token,
        data: {nombre, apellido, correo, telefono},
        msg:"Inicio de sesión exitoso",
        rol:'ciudadano'
    })
}

const verificarToken = async (req, res)=>{
    const {token} = req.params
    const usuario = await Usuarios.findOne({token})
    if(!usuario) return res.status(400).json({msg:"Lo sentimos, el token no es válido"})
    usuario.confirmEmail = true
    usuario.token = null
    await usuario.save()
    res.status(200).json({msg:"Correo confirmado exitosamente"})
}

const reportarIncidente = async (req,res)=>{
    const {
        fecha,
        hora,
        lugar,
        descripcion
    } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const reporte = new Reportes({
        fecha,
        hora,
        lugar,
        descripcion,
        ciudadano: req.ciudadano._id
    })
    await reporte.save()
    res.status(200).json({msg:"Reporte creado exitosamente"})
}
const recuperarPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {email} = req.body
    // Actividad 2 (Validaciones)
    
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }

    //? Validar si el email existe
    const ciudadanoBDD = await Usuarios.findOne({email})
    if (!ciudadanoBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }
    // Actividad 3 (Base de Datos)
    const token = ciudadanoBDD.crearToken()
    ciudadanoBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await ciudadanoBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Correo enviado, verifica tu email'})
}
const comprobarTokenPasword = async (req,res)=>{
    // Actividad 1 (Request) .../confirmar/
    const token = req.params?.token
    // Actividad 2 (Validaciones)
    //? Validar si el token existe
    if (!token){
        return res.status(400).json({error:'Lo sentimos, no se puede validar el token'})
    }
    //? Validar si el token es correcto
    const ciudadanoBDD = await Usuarios.findOne({token})
    if (!ciudadanoBDD){
        return res.status(404).json({error:'Lo sentimos, el token no existe'})
    }
    // Actividad 3 (Base de Datos)
    await ciudadanoBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Token confirmado, puedes cambiar tu password'})
}
const nuevoPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {
        password,
        confirmpassword
    } = req.body
    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    //? Validar si las contraseñas coinciden
    if (password !== confirmpassword){
        return res.status(400).json({error:'Lo sentimos, las contraseñas no coinciden'})
    }
    //? Validar si la contraseña es la misma a la almacenada en la base de datos
    const ciudadanoBDD = await Usuarios.findOne({token:req.params.token})
    if (!ciudadanoBDD){
        return res.status(404).json({error:'Lo sentimos, el token no existe'})
    }
    if (await ciudadanoBDD.matchPassword(password)){
        return res.status(400).json({error:'Lo sentimos, la contraseña es la misma'})
    }
    // Actividad 3 (Base de Datos)
    ciudadanoBDD.token = null
    ciudadanoBDD.password = await ciudadanoBDD.encrypPassword(password)
    await ciudadanoBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Contraseña actualizada, ya puedes iniciar sesión'})
}
const perfil=(req,res)=>{
    try {
        if (req.ciudadano){
            const {id, nombre, apellido, direccion, telefono, email, rol} = req.ciudadano 
            res.status(200).json(
                {
                    id,
                    nombre,
                    apellido,
                    direccion,
                    telefono,
                    email,
                    rol
                }
            )
        }else if (req.admin){
            const {nombre, apellido, telefono, email, rol} = req.admin 
            res.status(200).json(
                {
                    nombre,
                    apellido,
                    telefono,
                    email,
                    rol
                }
            )
        }else{
            res.status(400).json({msg:"Sesión no iniciada"})
        }
    } catch (error) {
        res.status(400).json({msg: error})
    }
}
const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    const {
        nombre,
        apellido,
        telefono
    } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`Lo sentimos, el id ${id} no es válido`})
    
    await Ciudadano.findByIdAndUpdate(id,{nombre,apellido,telefono})
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}
const actualizarPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {
        email,
        password,
        newpassword,
        confirmpassword
    } = req.body
    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    //? Validar si el email existe
    const ciudadanoBDD = await Ciudadano.findOne({email})
    if (!ciudadanoBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }
    //? Validar si la contraseña es la misma
    const validarPassword = await ciudadanoBDD.matchPassword(password)
    if (!validarPassword){
        return res.status(403).json({error:'Lo sentimos, la contraseña es incorrecta'})
    }
    //? Validar si la contraseña es la misma
    if (password === newpassword){
        return res.status(400).json({error:'Lo sentimos, la contraseña es la misma'})
    }
    //? Validar si las contraseñas coinciden
    if (newpassword !== confirmpassword){
        return res.status(400).json({error:'Lo sentimos, las contraseñas no coinciden'})
    }
    // Actividad 3 (Base de Datos)
    ciudadanoBDD.password = await ciudadanoBDD.encrypPassword(newpassword)
    await ciudadanoBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Contraseña actualizada'})
}
export {
    registro,
    login,
    verificarToken,
    reportarIncidente,
    recuperarPassword,
    comprobarTokenPasword,
    nuevoPassword,
    perfil,
    actualizarPerfil,
    actualizarPassword

}
