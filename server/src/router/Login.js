const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createToken, verifyToken, token } = require('../services/Jwt');
const Conexion = require('../database/Conexion');
const conec = new Conexion();
const fs = require('fs');
const path = require('path');
const PDFDocument = require("pdfkit-table");

router.get('/report/:version/:number', async function (req, res) {
    // Create a document
    const doc = new PDFDocument({
        margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
        }
    });

    console.log(doc.page.width)

    doc.pipe(res);

    let colTop = doc.y;

    doc.image(path.join(__dirname, "..", "path/to/ehil.png"), doc.options.margins.left, colTop, { width: 50, });

    let ypostimage = doc.y;

    doc.fontSize(12).text(
        "APPLE GYM PERÚ ",
        doc.options.margins.left + 170,
        colTop
    );

    doc.moveDown();
    doc.fontSize(10).text(
        "AV. LAS CALLES DEL MAR NRO 100",
        doc.options.margins.left + 140,
        colTop + 15
    );

    doc.moveDown();
    doc.fontSize(10).text(
        "064 1231546546 213154654",
        doc.options.margins.left + 162,
        colTop + 30
    );

    doc.fontSize(10).text(
        `RUC: 456789123120\nBOLETA\nB0001-895653`,
        doc.page.width - 140 - doc.options.margins.right,
        colTop+10
        , {
            width: 140,
            align: "center",
        });


    // doc.rect(
    //     doc.options.margins.left + 350,
    //     doc.options.margins.top-10,
    //     140,
    //     50).stroke();

        doc.rect(
            doc.page.width - 140 - doc.options.margins.right,
            doc.options.margins.top,
            140,
            50).stroke();

    // doc.rect(xleft3-30, doc.options.margins.top-10, 140, 60).stroke();

    doc.x = 0;

    doc.moveDown();

    const table = {
        title: "Detalle",
        subtitle: "Subtitle",
        headers: ["#", "CONCEPTO", "CANTIDAD", "PRECIO", "UNITARIO", "DESCUENTO", "IMPORTE"],
        rows: [
            ["1", "PLAN REGULAR - 3 MESES", "1.00", "210.00", "0.00", "210.00"],
            ["2", "INSCRIPCIÓN", "10.00", "10.00", "0.00", "10.00"]
        ],
    };

    console.log(doc.page.width)

    doc.table(table, {
        x: 0,
        y: ypostimage + 20,
        width: doc.page.width - doc.options.margins.left - doc.options.margins.right
    });

    doc.fontSize(12).text(
        "IMPORTE BRUTO: ",
        doc.x,
        doc.y + 10
    );

    doc.fontSize(12).text(
        "DESCUENTO: ",
        doc.options.margins.left + 300,
        doc.y
    );

    doc.fontSize(12).text(
        "IMPORTE NETO: ",
        doc.options.margins.left + 300,
        doc.y
    );

    const table1 = {
        title: "PAGOS ASOCIADOS",
        subtitle: "Subtitle",
        headers: ["#", "TRANSACCIÓN", "CONCEPTO", "FECHA PAGO", "IMPORTE"],
        rows: [
            ["1", "N° 2736 VENTAS", "INGRESO DEL COMPROBANTE B001-4102", "23/04/2022 08:09:47", "220.00"]
        ],
    };

    doc.table(table1, {
        width: doc.page.width
    });

    doc.fontSize(14).text(
        "TERMINOS Y CONDICIONES",
        doc.options.margins.left,
        doc.y
    );

    doc.fontSize(14).text(
        "NO HAY NINGÚN TIPO DE REEMBOLSO POR POLÍTICAS DE LA EMPRESA.",
        doc.options.margins.left,
        doc.y
    );

    doc.end();

    console.log(req.params);
    // res.send("ddata")
});



router.get('/createsession', async function (req, res) {
    try {

        let validate = await conec.query(`SELECT idUsuario ,clave FROM usuario 
        WHERE usuario = ?`, [
            req.query.usuario,
        ]);

        if (validate.length > 0) {

            let hash = bcrypt.compareSync(req.query.password, validate[0].clave);

            if (hash) {

                let usuario = await conec.query(`SELECT 
                idUsuario, 
                nombres,
                apellidos,
                idPerfil,
                estado
                FROM usuario
                WHERE idUsuario = ?`, [
                    validate[0].idUsuario
                ]);

                if (usuario[0].estado === 0) {
                    res.status(400).send("Su cuenta se encuentra inactiva.")
                    return;
                }

                let user = {
                    idUsuario: usuario[0].idUsuario,
                    nombres: usuario[0].nombres,
                    apellidos: usuario[0].apellidos,
                    estado: usuario[0].estado
                }

                let menu = await conec.query(`
                SELECT 
                m.idMenu,
                m.nombre,
                m.ruta,
                pm.estado,
                m.icon 
                FROM permisomenu as pm 
                INNER JOIN perfil as p on pm.idPerfil = p.idPerfil
                INNER JOIN menu as m on pm.idMenu = m.idMenu
                WHERE p.idPerfil = ?
                `, [
                    usuario[0].idPerfil,
                ]);

                let submenu = await conec.query(`
                SELECT 
                sm.idMenu,
                sm.idSubMenu,
                sm.nombre,
                sm.ruta,
                psm.estado
                FROM permisosubmenu as psm
                INNER JOIN perfil AS p ON psm.idPerfil = p.idPerfil
                INNER JOIN submenu AS sm on sm.idMenu = psm.idMenu and sm.idSubMenu = psm.idSubMenu
                WHERE psm.idPerfil = ?
                `, [
                    usuario[0].idPerfil,
                ]);

                const token = await createToken(user, 'userkeylogin');

                res.status(200).send({ ...user, token, menu, submenu })
            } else {
                res.status(400).send("Datos incorrectos, intente nuevamente.")
            }
        } else {
            res.status(400).send("Datos incorrectos, intente nuevamente.")
        }
    } catch (error) {
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.get('/closesession', async function (req, res) {
    try {

    } catch (error) {

    }
});

router.get('/validtoken', token, async function (req, res) {
    try {

        await verifyToken(req.token, 'userkeylogin');

        res.status(200).send("Ok");
    } catch (error) {
        if (error == "expired") {
            res.status(403).send("Sesión expirada")
        } else {
            res.status(500).send("Error del servidor, intente nuevamente.")
        }
    }
});

// router.post("/list", verifyToken, async (req, res) => {
//     try {
//         let result = await new Promise((resolve, reject) => {
//             jwt.verify(req.token, 'secretkey', (error, authorization) => {
//                 if (error) {
//                     reject("expired");
//                 } else {
//                     resolve(authorization);
//                 }
//             });
//         });

//         res.status(200).send({ "data": { "ok": "data list" }, "authorization": result });

//     } catch (error) {
//         if (error == "expired") {
//             res.status(403).send("Sesión expirada")
//         } else {
//             res.status(500).send("Error del servidor, intente nuevamente.")
//         }
//     }
// });


module.exports = router;