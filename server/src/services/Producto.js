const Conexion = require('../database/Conexion');
const { sendSuccess, sendError, sendClient, sendSave } = require('../tools/Message');
const { currentDate, currentTime, generateAlphanumericCode, generateNumericCode } = require('../tools/Tools');
const conec = new Conexion();

class Producto {

    async list(req) {
        try {
            const lista = await conec.query(`SELECT 
                p.idProducto,
                t.nombre as tipo,
                p.codigo,
                p.nombre,
                p.precio,
                p.estado,
                c.nombre AS categoria,
                m.nombre AS medida
                FROM producto AS p 
                INNER JOIN categoria AS c ON p.idCategoria = c.idCategoria 
                INNER JOIN medida AS m ON p.idMedida = m.idMedida       
                INNER JOIN tipoProducto AS t ON t.idTipoProducto = p.idTipoProducto
                WHERE
                ? = 0 
                OR
                ? = 1 AND p.nombre LIKE CONCAT(?,'%')       
                ORDER BY p.fecha DESC, p.hora DESC
                LIMIT ?,?`, [
                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
                req.query.buscar,

                parseInt(req.query.posicionPagina),
                parseInt(req.query.filasPorPagina)
            ])

            const resultLista = lista.map(function (item, index) {
                return {
                    ...item,
                    id: (index + 1) + parseInt(req.query.posicionPagina)
                }
            });

            const total = await conec.query(`SELECT COUNT(*) AS Total
                FROM producto AS p 
                INNER JOIN categoria AS c ON p.idCategoria = c.idCategoria 
                INNER JOIN medida AS m ON p.idMedida = m.idMedida 
                INNER JOIN tipoProducto AS t ON t.idTipoProducto = p.idTipoProducto
                WHERE
                ? = 0 
                OR
                ? = 1 AND p.nombre LIKE CONCAT(?,'%')`, [
                parseInt(req.query.opcion),

                parseInt(req.query.opcion),
                req.query.buscar,

            ]);
            return { "result": resultLista, "total": total[0].Total }
        } catch (error) {
            console.log(error)
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async add(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            const {
                idCategoria,
                idMedida,
                nombre,
                codigo,
                idCodigoSunat,
                descripcion,
                precio,
                costo,
                tipo,
                publicar,
                inventariado,
                negativo,
                estado,
                idUsuario
            } = req.body;

            const resultProducto = await conec.execute(connection, 'SELECT idProducto FROM producto');
            const idProducto = generateAlphanumericCode("PD0001", resultProducto, 'idProducto');

            const resultKardex = await conec.execute(connection, 'SELECT idKardex FROM kardex');
            let idKardex = 0;

            if (resultKardex.length != 0) {
                const quitarValor = resultKardex.map(item => parseInt(item.idKardex.replace("KD", '')));
                idKardex = Math.max(...quitarValor);
            }

            await conec.execute(connection, `INSERT INTO producto(
                idProducto,
                idCategoria,
                idConcepto,
                idMedida,
                nombre,
                codigo,
                idCodigoSunat,
                descripcion,
                precio,
                costo,
                idTipoProducto,
                publicar,
                inventariado,
                negativo,
                estado,
                fecha,
                hora,
                fupdate,
                hupdate,
                idUsuario
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                idProducto,
                idCategoria,
                'CP0001',
                idMedida,
                nombre,
                codigo,
                idCodigoSunat,
                descripcion,
                precio,
                costo,
                tipo,
                publicar,
                inventariado,
                negativo,
                estado,
                currentDate(),
                currentTime(),
                currentDate(),
                currentTime(),
                idUsuario,
            ])

            const listaInventarios = await conec.execute(connection, 'SELECT idInventario FROM inventario');
            let idInventario = generateNumericCode(1, listaInventarios, 'idInventario');

            for (const inventariado of req.body.inventario) {
                await conec.execute(connection, `INSERT INTO inventario(
                    idInventario,
                    idProducto,
                    idAlmacen,
                    cantidad,
                    cantidadMaxima,
                    cantidadMinima
                ) VALUES(?,?,?,?,?,?)`, [
                    idInventario,
                    idProducto,
                    inventariado.idAlmacen,
                    inventariado.cantidad,
                    inventariado.cantidadMaxima,
                    inventariado.cantidadMinima,
                ]);

                await conec.execute(connection, `INSERT INTO kardex(
                    idKardex,
                    idProducto,
                    idTipoKardex,
                    idMotivoKardex,
                    detalle,
                    cantidad,
                    costo,
                    idAlmacen,
                    hora,
                    fecha,
                    idUsuario
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
                    `KD${String(idKardex += 1).padStart(4, '0')}`,
                    idProducto,
                    'TK0001',
                    'MK0001',
                    'INGRESO AL CREAR EL PRODUCTO',
                    inventariado.cantidad,
                    costo,
                    inventariado.idAlmacen,
                    currentTime(),
                    currentDate(),
                    idUsuario
                ]);

                idInventario++;
            }

            await conec.commit(connection);
            return "insert";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }


    async id(req) {
        try {
            let result = await conec.query('SELECT * FROM producto WHERE idProducto = ?', [
                req.query.idProducto,
            ]);

            if (result.length > 0) {
                return result[0]
            } else {
                return "Datos no encontrados";
            }

        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async update(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            await conec.execute(connection, `UPDATE producto SET
                idCategoria = ?,
                idMedida = ?,     
                nombre = ?,
                codigo = ?,
                idCodigoSunat = ?,
                descripcion = ?,
                precio = ?,
                costo = ?,
                publicar = ?,
                inventariado = ?,
                negativo = ?,
                estado = ?,
                idUsuario = ?,
                fupdate = ?,
                hupdate = ?
                WHERE idProducto = ?
            `, [
                req.body.idCategoria,
                req.body.idMedida,
                req.body.nombre,
                req.body.codigo,
                req.body.idCodigoSunat,
                req.body.descripcion,
                req.body.precio,
                req.body.costo,
                req.body.publicar,
                req.body.inventariado,
                req.body.negativo,
                req.body.estado,
                req.body.idUsuario,
                currentDate(),
                currentTime(),
                req.body.idProducto
            ]);

            await conec.commit(connection);
            return "update";

        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            HTMLFormControlsCollection.log(error)
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async delete(req) {
        let connection = null;
        try {
            connection = await conec.beginTransaction();

            let producto = await conec.execute(connection, `SELECT * FROM ventaDetalle WHERE idProducto  = ?`, [
                req.query.idProducto
            ]);

            // Consulta el producto en algún almacen; de existir se procede con la eliminación de los almacenes
            let almacenes = await conec.execute(connection, `SELECT pa.*, p.costo
                FROM productoAlmacen AS pa
                INNER JOIN producto AS p on pa.idProducto = p.idProducto
                WHERE pa.idProducto = ?`, [
                req.query.idProducto
            ]);

            if (producto.length > 0) {
                await conec.rollback(connection);
                return "No se puede eliminar el producto ya que esta ligado a una venta.";
            }

            await conec.execute(connection, `DELETE FROM producto WHERE idProducto  = ?`, [
                req.query.idProducto
            ]);

            if (almacenes.length != 0) {
                await conec.execute(connection, `DELETE FROM productoAlmacen WHERE idProducto = ?`, [
                    req.query.idProducto
                ]);

                const resultKardex = await conec.execute(connection, 'SELECT idKardex FROM kardex');
                let idKardex = 0;

                if (resultKardex.length != 0) {
                    const quitarValor = resultKardex.map(item => parseInt(item.idKardex.replace("KD", '')));
                    idKardex = Math.max(...quitarValor);
                }

                for (const almacen of almacenes) {
                    await conec.execute(connection, `INSERT INTO kardex(
                        idKardex,
                        idProducto,
                        idTipoKardex,
                        idMotivoKardex,
                        detalle,
                        cantidad,
                        costo,
                        idAlmacen,
                        hora,
                        fecha,
                        idUsuario
                    ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [
                        `KD${String(idKardex += 1).padStart(4, '0')}`,
                        req.query.idProducto,
                        'TK0002',
                        'MK0003',
                        'deleted',
                        almacen.cantidad,
                        almacen.costo,
                        almacen.idAlmacen,
                        currentTime(),
                        currentDate(),
                        req.query.idUsuario
                    ]);
                }
            }

            await conec.commit(connection)
            return "delete";
        } catch (error) {
            if (connection != null) {
                await conec.rollback(connection);
            }
            console.log(error)
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async detalle(req) {
        try {

            const cabecera = await conec.query(`SELECT 
                l.idProducto,
                m.nombre as categoria,
                l.descripcion as producto,
                l.costo,
                l.precio,
                CASE
                WHEN l.estado = 1 THEN 'Disponible'
                WHEN l.estado = 2 THEN 'Reservado'
                WHEN l.estado = 3 THEN 'Vendido'
                ELSE 'Inactivo' END AS productostado,

                l.medidaFrontal,
                l.costadoDerecho,
                l.costadoIzquierdo,
                l.medidaFondo,
                l.areaProducto,
                l.numeroPartida,

                IFNULL(l.limiteFrontal,'') AS limiteFrontal,
                IFNULL(l.limiteDerecho,'') AS limiteDerecho,
                IFNULL(l.limiteIzquierdo,'') AS limiteIzquierdo,
                IFNULL(l.limitePosterior,'') AS limitePosterior,
                IFNULL(l.ubicacionProducto,'') AS ubicacionProducto

                FROM producto AS l
                INNER JOIN categoria AS m  ON l.idCategoria = m.idCategoria
                WHERE l.idProducto = ?`, [
                req.query.idProducto,
            ]);

            const venta = await conec.query(`SELECT 
            v.idVenta,
            v.idCliente
            FROM venta AS v 
            INNER JOIN ventaDetalle AS vd ON v.idVenta = vd.idVenta
            WHERE vd.idProducto = ? AND v.estado IN (1,2)`, [
                req.query.idProducto,
            ])

            if (venta.length > 0) {
                const socios = await conec.query(`SELECT 
                    c.idCliente ,
                    c.documento,
                    c.informacion,
                    a.estado
                    FROM asociado AS a
                    INNER JOIN clienteNatural AS c ON a.idCliente = c.idCliente
                    WHERE a.idVenta = ?`, [
                    venta[0].idVenta
                ]);

                const detalle = await conec.query(`SELECT 
                    c.idCobro,
                    co.nombre as comprobante,
                    c.serie,
                    c.numeracion,
                    cl.documento,
                    cl.informacion,
                    CASE 
                    WHEN cn.idConcepto IS NOT NULL THEN cn.nombre
                    ELSE CASE WHEN cv.idPlazo = 0 THEN 'CUOTA INICIAL' ELSE 'CUOTA' END END AS detalle,
                    IFNULL(CONCAT(cp.nombre,' ',v.serie,'-',v.numeracion),'') AS comprobanteRef,
                    m.simbolo,
                    m.codiso,
                    b.nombre as banco,  
                    c.observacion, 
                    DATE_FORMAT(c.fecha,'%d/%m/%Y') as fecha, 
                    c.hora,
                    IFNULL(SUM(cd.precio*cd.cantidad),SUM(cv.precio)) AS monto
                    FROM cobro AS c
                    INNER JOIN clienteNatural AS cl ON c.idCliente = cl.idCliente
                    INNER JOIN banco AS b ON c.idBanco = b.idBanco
                    INNER JOIN moneda AS m ON c.idMoneda = m.idMoneda 
                    INNER JOIN comprobante AS co ON co.idComprobante = c.idComprobante
                    LEFT JOIN cobroDetalle AS cd ON c.idCobro = cd.idCobro
                    LEFT JOIN concepto AS cn ON cd.idConcepto = cn.idConcepto 
                    LEFT JOIN cobroVenta AS cv ON cv.idCobro = c.idCobro 
                    LEFT JOIN venta AS v ON cv.idVenta = v.idVenta 
                    LEFT JOIN comprobante AS cp ON v.idComprobante = cp.idComprobante
                    LEFT JOIN notaCredito AS nc ON c.idCobro = nc.idCobro AND nc.estado = 1

                    WHERE 
                    c.idProcedencia = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL
                    OR 
                    c.idProcedencia = ? AND c.estado = 1 AND nc.idNotaCredito IS NULL
                    GROUP BY c.idCobro`, [
                    venta[0].idVenta,
                    req.query.idProducto,
                ]);

                return {
                    "producto": cabecera[0],
                    "venta": venta[0],
                    "socios": socios,
                    "detalle": detalle
                }
            } else {
                return "No hay información para mostrar.";
            }
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listarCombo(req) {
        try {
            const result = await conec.query(`SELECT 
            p.idProducto,
            p.tipo,
            p.nombre,
            p.costo,
            m.nombre as medida 
            FROM producto AS p
            INNER JOIN medida as m ON m.idMedida = p.idMedida
            WHERE p.idTipoProducto <> 'TP0003'`);
            return result
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listarFilter(req) {
        try {
            const result = await conec.procedure("CALL Filtrar_Productos_Para_Venta(?)", [
                req.query.filtrar,
            ])
            return result

        } catch (error) {
            console.log(error)
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listaEstadoProducto(req) {
        try {

            const sucursal = await conec.query(`SELECT 
            nombre,
            ubicacion,
            area 
            FROM sucursal WHERE idSucursal = ?`, [
                req.query.idSucursal,
            ]);

            const lista = await conec.query(`SELECT 
                l.idProducto,
                l.descripcion AS producto,
                m.nombre AS categoria,
                l.costo,
                l.precio,
                l.estado,
                l.medidaFrontal,
                l.costadoDerecho,
                l.costadoIzquierdo,
                l.medidaFondo,
                l.areaProducto
                FROM producto AS l INNER JOIN categoria AS m 
                ON l.idCategoria = m.idCategoria 
                WHERE
                ? = 0 AND m.idSucursal = ?
                OR
                (? <> 0 AND l.estado = ? AND m.idSucursal = ?)`, [
                req.query.estadoProducto,
                req.query.idSucursal,

                req.query.estadoProducto,
                req.query.estadoProducto,
                req.query.idSucursal,
            ])

            return { "sucursal": sucursal[0], "lista": lista };
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

    async listardeudasProducto(req) {
        try {
            const result = await conec.query(`SELECT 
            v.idVenta, 
            cl.idCliente,
            cl.documento, 
            cl.informacion, 
            lo.descripcion AS producto,
            ma.nombre AS categoria,
            cm.nombre AS comprobante, 
            v.serie, 
            v.numeracion, 
            (SELECT IFNULL(DATE_FORMAT(MIN(co.fecha),'%d/%m/%Y'),'') FROM cobro AS co WHERE co.idProcedencia = v.idVenta ) AS primerPago,
            (SELECT IFNULL(p.monto,0) FROM plazo AS p WHERE p.idVenta = v.idVenta LIMIT 1) AS cuotaMensual,
            (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.idVenta = v.idVenta) AS cuoTotal,
            (SELECT IFNULL(COUNT(*), 0) FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) AS numCuota,
            CASE WHEN v.frecuencia = 30 THEN 'FIN DE MES' ELSE 'CADA QUINCENA' END AS frecuenciaName, 
            CASE 
            WHEN v.credito = 1 THEN DATE_ADD(v.fecha,interval v.frecuencia day)
            ELSE (SELECT IFNULL(MIN(p.fecha),'') FROM plazo AS p WHERE p.estado = 0 AND p.idVenta = v.idVenta) END AS fechaPago,
            v.fecha, 
            v.hora, 
            v.estado,
            v.credito,
            v.frecuencia,
            m.idMoneda,
            m.simbolo,
            IFNULL(SUM(vd.precio*vd.cantidad),0) AS total,
            (
             SELECT IFNULL(SUM(cv.precio),0) 
             FROM cobro AS c 
             LEFT JOIN notaCredito AS nc ON c.idCobro = nc.idCobro AND nc.estado = 1
             LEFT JOIN cobroVenta AS cv ON c.idCobro = cv.idCobro 
             WHERE c.idProcedencia = v.idVenta AND c.estado = 1 AND nc.idNotaCredito IS NULL
            ) AS cobrado 
            FROM venta AS v 
            INNER JOIN moneda AS m ON m.idMoneda = v.idMoneda
            INNER JOIN comprobante AS cm ON v.idComprobante = cm.idComprobante 
            INNER JOIN clienteNatural AS cl ON v.idCliente = cl.idCliente 
            INNER JOIN ventaDetalle AS vd ON vd.idVenta = v.idVenta 
            INNER JOIN producto AS lo ON vd.idProducto = lo.idProducto 
            INNER JOIN categoria AS ma ON lo.idCategoria = ma.idCategoria 
            WHERE  
            ? = 0 AND v.estado = 2 AND v.idSucursal = ? 
            OR
            ? = 1 AND v.estado = 2            
            GROUP BY v.idVenta
            ORDER BY v.fecha DESC, v.hora DESC`, [
                parseInt(req.query.porSucursal),
                req.query.idSucursal,

                parseInt(req.query.porSucursal),
            ]);

            return result;
        } catch (error) {
            return "Se produjo un error de servidor, intente nuevamente.";
        }
    }

}

module.exports = Producto;