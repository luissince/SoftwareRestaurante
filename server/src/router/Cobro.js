const express = require('express');
const router = express.Router();
const { currentDate, currentTime } = require('../tools/Tools');
const Conexion = require('../database/Conexion');
const conec = new Conexion();

router.get('/list', async function (req, res) {
    try {
        let lista = await conec.query(`SELECT 
        c.idCobro, 
        cl.documento,
        cl.informacion,  
        CASE 
        WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
        ELSE CONCAT(cp.nombre,': ',v.serie,'-',v.numeracion) END AS detalle,
        m.simbolo,
        b.nombre as banco,  
        c.observacion, 
        DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
        c.hora,
        IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
        LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
        LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
        LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
        LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
        LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
        WHERE 
        ? = 0 AND c.idProyecto = ?
        OR
        ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?
        GROUP BY c.idCobro
        ORDER BY c.fecha DESC,c.hora DESC
        LIMIT ?,?`, [
            parseInt(req.query.opcion),
            req.query.idProyecto,

            parseInt(req.query.opcion),
            req.query.buscar,
            req.query.idProyecto,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ]);

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index + 1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total        
        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
        WHERE 
        ? = 0 AND c.idProyecto = ?
        OR
        ? = 1 AND cl.informacion LIKE CONCAT(?,'%') AND c.idProyecto = ?`, [
            parseInt(req.query.opcion),
            req.query.idProyecto,

            parseInt(req.query.opcion),
            req.query.buscar,
            req.query.idProyecto,
        ]);

        res.status(200).send({ "result": resultLista, "total": total[0].Total });
    } catch (error) {
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/cronograma', async function (req, res) {
    try {
        let result = await conec.query(`SELECT 
        numCuota,
        DATE_FORMAT(fecha,'%d-%m-%Y') as fecha
        FROM venta WHERE idVenta = 'VT0001'`);

        let total = await conec.query(`SELECT 
        IFNULL(SUM(vd.precio*vd.cantidad),0) AS total
        FROM venta AS v 
        LEFT JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
        WHERE v.idVenta = 'VT0001'`);

        let now = new Date();
        console.log("ahora: " + now.getFullYear(), (now.getMonth() + 1), now.getDate());

        const parts = result[0].fecha.split('-');
        let mydate = new Date(parts[2], parts[1] - 1, parts[0]);
        console.log("inicio: " + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate())

        let inicioDate = new Date(mydate);
        // inicioDate.setMonth(inicioDate.getMonth() + 1)
        // console.log("inicio: " + inicioDate.getFullYear(), (inicioDate.getMonth() + 1), inicioDate.getDate());

        // var myNow = new Date();
        // console.log(myNow.getFullYear(), (myNow.getMonth() + 1), myNow.getDate());
        var ultimoDate = new Date(inicioDate)
        ultimoDate.setMonth(ultimoDate.getMonth() + result[0].numCuota)
        // console.log("fin: " + ultimoDate.getFullYear() + "-" + (ultimoDate.getMonth() + 1) + "-" + ultimoDate.getDate())
        let i = 0;
        let arrayCuotas = [];
        let cuotaMes = total[0].total / result[0].numCuota;
        while (inicioDate < ultimoDate) {
            i++;
            inicioDate.setMonth(inicioDate.getMonth() + 1)
            arrayCuotas.push("cuota-" + (i < 10 ? "0" + i : i) + ": " + inicioDate.getFullYear() + "-" + ((inicioDate.getMonth() + 1) < 10 ? "0" + (inicioDate.getMonth() + 1) : (inicioDate.getMonth() + 1)) + "-" + inicioDate.getDate() + " MONTO:" + cuotaMes)
            // console.log();
        }



        // let mydate = new Date(result[0].fecha);
        // console.log(mydate.getDay());
        // console.log(mydate.getMonth());
        // console.log(mydate.getFullYear());

        res.status(200).send({ result, total, arrayCuotas });
    } catch (error) {
        console.log(error)
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let result = await conec.execute(connection, 'SELECT idCobro FROM cobro');
        let idCobro = "";
        if (result.length != 0) {

            let quitarValor = result.map(function (item) {
                return parseInt(item.idCobro.replace("CB", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CB000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CB00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CB0' + incremental;
            } else {
                codigoGenerado = 'CB' + incremental;
            }

            idCobro = codigoGenerado;
        } else {
            idCobro = "CB0001";
        }

        let comprobante = await conec.execute(connection, `SELECT 
        serie,
        numeracion 
        FROM comprobante 
        WHERE idComprobante  = ?
        `, [
            req.body.idComprobante
        ]);

        let numeracion = 0;

        let cobros = await conec.execute(connection, 'SELECT numeracion FROM cobro WHERE idComprobante = ?', [
            req.body.idComprobante
        ]);

        if (cobros.length > 0) {
            let quitarValor = cobros.map(function (item) {
                return parseInt(item.numeracion);
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            numeracion = incremental;
        } else {
            numeracion = comprobante[0].numeracion;
        }

        await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            idProyecto,
            idComprobante,
            serie,
            numeracion,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            idCobro,
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idMoneda,
            req.body.idBanco,
            req.body.idProcedencia,
            req.body.idProyecto,
            req.body.idComprobante,
            comprobante[0].serie,
            numeracion,
            req.body.metodoPago,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime()
        ]);

        let monto = 0;
        for (let item of req.body.cobroDetalle) {
            await conec.execute(connection, `INSERT INTO cobroDetalle(
                idCobro, 
                idConcepto, 
                precio, 
                cantidad, 
                idImpuesto)
                VALUES(?,?,?,?,?)`, [
                idCobro,
                item.idConcepto,
                item.monto,
                item.cantidad,
                item.idImpuesto
            ])
            monto += item.cantidad * item.monto;
        }

        await conec.execute(connection, `INSERT INTO bancoDetalle(
        idBanco,
        idProcedencia,
        tipo,
        monto,
        fecha,
        hora,
        idUsuario)
        VALUES(?,?,?,?,?,?,?)`, [
            req.body.idBanco,
            idCobro,
            1,
            monto,
            currentDate(),
            currentTime(),
            req.body.idUsuario,
        ]);

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')

    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.post('/cobro', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let cobro = await conec.execute(connection, 'SELECT idCobro FROM cobro');
        let idCobro = "";
        if (cobro.length != 0) {

            let quitarValor = cobro.map(function (item) {
                return parseInt(item.idCobro.replace("CB", ''));
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            let codigoGenerado = "";
            if (incremental <= 9) {
                codigoGenerado = 'CB000' + incremental;
            } else if (incremental >= 10 && incremental <= 99) {
                codigoGenerado = 'CB00' + incremental;
            } else if (incremental >= 100 && incremental <= 999) {
                codigoGenerado = 'CB0' + incremental;
            } else {
                codigoGenerado = 'CB' + incremental;
            }

            idCobro = codigoGenerado;
        } else {
            idCobro = "CB0001";
        }

        let total = await conec.execute(connection, `SELECT 
        IFNULL(SUM(vd.precio*vd.cantidad),0) AS total 
        FROM venta AS v
        LEFT JOIN ventaDetalle AS vd ON v.idVenta  = vd.idVenta
        WHERE v.idVenta  = ?`, [
            req.body.idVenta,
        ]);


        let cobrado = await conec.execute(connection, `SELECT 
        IFNULL(SUM(cv.precio),0) AS total
        FROM cobro AS c 
        LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro
        WHERE c.idProcedencia = ?`, [
            req.body.idVenta,
        ]);

        let comprobante = await conec.execute(connection, `SELECT 
        serie,
        numeracion 
        FROM comprobante 
        WHERE idComprobante  = ?
        `, [
            req.body.idComprobante
        ]);

        let numeracion = 0;

        let cobros = await conec.execute(connection, 'SELECT numeracion FROM cobro WHERE idComprobante = ?', [
            req.body.idComprobante
        ]);

        if (cobros.length > 0) {
            let quitarValor = cobros.map(function (item) {
                return parseInt(item.numeracion);
            });

            let valorActual = Math.max(...quitarValor);
            let incremental = valorActual + 1;
            numeracion = incremental;
        } else {
            numeracion = comprobante[0].numeracion;
        }

        await conec.execute(connection, `INSERT INTO cobro(
            idCobro, 
            idCliente, 
            idUsuario, 
            idMoneda, 
            idBanco, 
            idProcedencia,
            idComprobante,
            serie,
            numeracion,
            metodoPago, 
            estado, 
            observacion, 
            fecha, 
            hora) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            idCobro,
            req.body.idCliente,
            req.body.idUsuario,
            req.body.idMoneda,
            req.body.idBanco,
            req.body.idVenta,
            req.body.idComprobante,
            comprobante[0].serie,
            numeracion,
            req.body.metodoPago,
            req.body.estado,
            req.body.observacion,
            currentDate(),
            currentTime()
        ]);

        let montoCobrado = cobrado[0].total + parseFloat(req.body.valorRecibido);
        if (montoCobrado >= total[0].total) {
            await conec.execute(connection, `UPDATE venta SET estado = 1 WHERE idVenta = ?`, [
                req.body.idVenta,
            ]);
        }

        let monto = 0;

        for (let item of req.body.plazos) {
            if (item.selected) {
                await conec.execute(connection, `INSERT INTO cobroVenta(
                    idCobro,
                    idVenta,
                    idPlazo,
                    precio) 
                    VALUES (?,?,?,?)`, [
                    idCobro,
                    req.body.idVenta,
                    item.idPlazo,
                    parseFloat(item.monto)
                ]);

                await conec.execute(connection, `UPDATE plazo 
                SET estado = 1
                WHERE idPlazo  = ?
                `, [
                    item.idPlazo
                ]);

                monto += parseFloat(item.monto)
            }
        }

        await conec.execute(connection, `INSERT INTO bancoDetalle(
        idBanco,
        idProcedencia,
        tipo,
        monto,
        fecha,
        hora,
        idUsuario)
        VALUES(?,?,?,?,?,?,?)`, [
            req.body.idBanco,
            idCobro,
            1,
            monto,
            currentDate(),
            currentTime(),
            req.body.idUsuario,
        ]);

        await conec.commit(connection);
        res.status(201).send('Datos insertados correctamente');
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/id', async function (req, res) {
    try {
        let result = await conec.query(`SELECT
        c.idCobro,
        c.metodoPago,
        c.estado,
        c.observacion,
        DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha,
        c.hora,

        cl.documento,
        cl.informacion,

        b.nombre as banco,

        m.codiso,
        m.simbolo,

        IFNULL(SUM(cb.precio*cb.cantidad),SUM(cv.precio)) AS monto

        FROM cobro AS c
        INNER JOIN cliente AS cl ON c.idCliente = cl.idCliente
        INNER JOIN banco AS b ON c.idBanco = b.idBanco
        INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda
        LEFT JOIN cobroDetalle AS cb ON c.idCobro = cb.idCobro
        LEFT JOIN cobroVenta AS cv ON c.idCobro  = cv.idCobro 
        WHERE c.idCobro = ?
        GROUP BY  c.idCobro`, [
            req.query.idCobro
        ]);

        if (result.length > 0) {

            let detalle = await conec.query(`SELECT 
            co.nombre as concepto,
            cd.precio,
            cd.cantidad,
            imp.nombre as impuesto,
            imp.porcentaje
            FROM cobroDetalle AS cd 
            INNER JOIN concepto AS co ON cd.idConcepto = co.idConcepto
            INNER JOIN impuesto AS imp ON cd.idImpuesto  = imp.idImpuesto 
            WHERE cd.idCobro = ?
            `, [
                req.query.idCobro
            ]);

            let venta = await conec.query(`SELECT  
            cp.nombre AS comprobante,
            v.serie,
            v.numeracion,
            (SELECT IFNULL(SUM(vd.precio*vd.cantidad),0) FROM ventaDetalle AS vd WHERE vd.idVenta = v.idVenta ) AS total,
            (SELECT IFNULL(SUM(cv.precio),0) FROM cobroVenta AS cv WHERE cv.idVenta = v.idVenta ) AS cobrado,
            cv.precio
            FROM cobroVenta AS cv
            INNER JOIN venta AS v ON cv.idVenta = v.idVenta 
            INNER JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
            WHERE cv.idCobro = ?`, [
                req.query.idCobro
            ]);

            res.status(200).send({
                "cabecera": result[0],
                "detalle": detalle,
                "venta": venta
            });
        } else {
            res.status(400).send("Datos no encontrados");
        }

    } catch (error) {
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

router.delete('/anular', async function (req, res) {
    let connection = null;
    try {
        connection = await conec.beginTransaction();

        let cobro = await conec.execute(connection, `SELECT idProcedencia FROM cobro WHERE idCobro = ?`, [
            req.query.idCobro
        ]);

        if (cobro.length > 0) {
            let venta = await conec.execute(connection, `SELECT idVenta FROM venta WHERE idVenta  = ?`, [
                cobro[0].idProcedencia
            ]);

            if (venta.length > 0) {
                let plazos = await conec.execute(connection, `SELECT idPlazo,estado FROM plazo 
                WHERE idVenta = ? AND estado = 1`, [
                    venta[0].idVenta
                ]);

                let arrPlazos = plazos.map(function (item) {
                    return item.idPlazo;
                });

                let maxPlazo = Math.max(...arrPlazos);

                let cobroVenta = await conec.execute(connection, `SELECT idPlazo FROM cobroVenta 
                WHERE idCobro = ?`, [
                    req.query.idCobro
                ]);

                let arrCobroVenta = cobroVenta.map(function (item) {
                    return item.idPlazo;
                });

                let maxCobroVenta = Math.max(...arrCobroVenta);

                if (maxPlazo == maxCobroVenta) {
                    for (let item of cobroVenta) {
                        await conec.execute(connection, `UPDATE plazo SET estado = 0 WHERE idPlazo = ?`, [
                            item.idPlazo
                        ]);
                    }

                    await conec.execute(connection, `UPDATE venta SET estado = 2
                    WHERE idVenta = ?`, [
                        venta[0].idVenta
                    ]);
                } else {
                    res.status(400).send("No se puede eliminar el cobro ya tiene plazos ligados que son inferiores.");
                    return;
                }
            }
        }

        await conec.execute(connection, `DELETE FROM cobro WHERE idCobro = ?`, [
            req.query.idCobro
        ]);

        await conec.execute(connection, `DELETE FROM cobroDetalle WHERE idCobro = ?`, [
            req.query.idCobro
        ]);

        await conec.execute(connection, `DELETE FROM cobroVenta WHERE idCobro = ?`, [
            req.query.idCobro
        ]);

        await conec.execute(connection, `DELETE FROM bancoDetalle WHERE idProcedencia  = ?`, [
            req.query.idCobro
        ]);

        await conec.commit(connection);
        res.status(201).send("Se eliminó la transacción correctamente.");
    } catch (error) {
        if (connection != null) {
            await conec.rollback(connection);
        }
        res.status(500).send("Se produjo un error de servidor, intente nuevamente.");
    }
});

module.exports = router;