import {Router} from 'express'
import { 
    perfil,
    registro,
    login,
    reportarIncidente,
    verificarToken,
    recuperarPassword,
    comprobarTokenPasword,
    nuevoPassword,
    actualizarPerfil,
} from '../controllers/ciudadano_controller.js'
import verificarAutenticacion from '../middlewares/auth.js'
import { validacionCiudadano } from '../middlewares/validacionCiudadanos.js'

const router = Router()
router.get('/perfil',verificarAutenticacion,perfil)
router.put('/actualizar-perfil/:id',verificarAutenticacion,actualizarPerfil)
router.post('/ciudadano/register',validacionCiudadano,registro)
router.post('/ciudadano/login',login)
router.get('/ciudadano/verify/:token',verificarToken)
router.get('/ciudadano/confirmar/:token',comprobarTokenPasword)
router.post('/ciudadano/recuperarcontrasena',recuperarPassword)
router.post('/ciudadano/nuevapassword/:token',nuevoPassword)

router.post('/ciudadano/reports',verificarAutenticacion,reportarIncidente)

export default router;