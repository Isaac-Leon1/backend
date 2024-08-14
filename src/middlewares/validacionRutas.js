import { check, validationResult } from 'express-validator'

export const validacionRutas =[
    
    check("nombre")
        .notEmpty()
            .withMessage('El campo nombre no pueden estar vacío')
        .isLength({ min: 3, max: 20 })
            .withMessage('El campo nombre debe tener entre 3 y 20 caracteres')
        .isAlpha('es-ES', { ignore: 'áéíóúÁÉÍÓÚñÑ ' })
            .withMessage('El campo "nombre" debe contener solo letras')
        .customSanitizer(value => typeof value === 'string' ? value.trim() : value),

    check(["empiezaEn","finalizaEn"])
        .notEmpty()
            .withMessage('El campo Inicio y Finalización de Ruta no pueden estar vacíos')
        .isLength({ min: 3, max: 25 })
            .withMessage('El campo "empieza en" y/o "finalizaEn" debe tener entre 3 y 25 caracteres')
        .customSanitizer(value => typeof value === 'string' ? value.trim() : value),

    check("tipoResiduos")
        .isIn(["Orgánico","Inorgánico","Orgánico e Inorgánico"])
            .withMessage('El tipo de residuo debe ser "Orgánico" o "Inorgánico".')
        .customSanitizer(value => typeof value === 'string' ? value.trim() : value),


    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            return res.status(400).send({ errors: errors.array() });
        }
    }
]