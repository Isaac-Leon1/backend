import {Router} from 'express'
import { 
    login,
    registro,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    nuevoPassword,
    listarReportes,
    eliminarReporte,
    detalleReporte,
    actualizarReporte
} from '../controllers/administrador_controller.js'
import verificarAutenticacion from '../middlewares/auth.js'
import { validacionAdministrador } from '../middlewares/validacionAdministrador.js'

const router = Router()

router.post('/login',login)
router.post('/registro',validacionAdministrador,registro)
router.get('/confirmar/:token',confirmEmail)
router.post('/recuperar-password',recuperarPassword)
router.get('/recuperar-password/:token',comprobarTokenPasword)
router.post('/nuevo-password/:token',nuevoPassword)
router.get('/administrador/reportes',verificarAutenticacion,listarReportes)
router.route('/administrador/reporte/:id')
    .get(verificarAutenticacion,detalleReporte)
    .put(verificarAutenticacion,actualizarReporte)
    .delete(verificarAutenticacion,eliminarReporte)
// router.put('/administrador/actualizarpassword',verificarAutenticacion,actualizarPassword)
// router.put('/administrador/:id',verificarAutenticacion,actualizarPerfil)

export default router