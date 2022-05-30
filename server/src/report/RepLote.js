const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { numberFormat, formatMoney, currentDate } = require('../tools/Tools');

class RepLote {

    async repDetalleLote(sedeInfo, data) {

        const lote = data.lote

        try {
            const doc = new PDFDocument({
                font: 'Helvetica',
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });


            doc.info["Title"] = "Detalle del Lote.pdf"

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 80;
            let titleX = orgX + 150;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75, });

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                titleX,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `RUC: ${sedeInfo.ruc}\n${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`,
                titleX,
                orgY + 17,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                "RESUMEN DE LOTE",
                medioX,
                cabeceraY,
                {
                    width: 250,
                }
            );

            doc.x = doc.options.margins.left;

            doc.opacity(0.7);

            doc.fontSize(h3).text(
                "COMPROBANTE",
                orgX,
                doc.y + 14
            )

            doc.fill("#000000");
            doc.lineGap(4);
            doc.opacity(1);

            doc.fontSize(h3).text(
                `Cliente: ${lote.cliente} ${lote.documento}\nFecha: ${lote.fecha} - ${lote.hora}\nNotas: ...\nForma de venta: ${lote.tipo === 1 ? "CONTADO" : "CRÉDITO"}\nEstado: ${lote.estado === 1 ? "COBRADO" : "POR COBRAR"}\nTotal: ${lote.simbolo} ${lote.monto}\nArchivos adjuntos: ...`,
                orgX,
                doc.y + 5
            );

            doc.lineGap(0);

            let colY = doc.y + 10;

            doc.opacity(0.7);
            doc.fontSize(h3).text(
                "DESCRIPCIÓN",
                orgX,
                colY
            );

            doc.fill("#000000");
            doc.lineGap(4);
            doc.opacity(1);

            doc.fontSize(h3).text(
                `Manzana: ${lote.manzana}\nLote: ${lote.lote}\nEstado: ${lote.lotestado}`,
                orgX,
                doc.y + 5
            );

            doc.lineGap(0);

            doc.opacity(0.7);
            doc.fontSize(h3).text(
                "MEDIDAS",
                orgX + 170,
                colY
            );

            doc.fill("#000000");
            doc.lineGap(4);
            doc.opacity(1);

            doc.fontSize(h3).text(
                `Medida Frontal: ${lote.medidaFrontal}\nCoste Derecho: ${lote.costadoDerecho}\nCoste Izquierdo: ${lote.costadoIzquierdo}\nMedida Fondo: ${lote.medidaFondo}\nArea Lote: ${lote.areaLote}\nN° Partida: ${lote.numeroPartida}`,
                orgX + 170,
                doc.y + 5
            );

            doc.lineGap(0);

            doc.opacity(0.7);
            doc.fontSize(h3).text(
                "LÍMITE",
                orgX + 340,
                colY
            );

            doc.fill("#000000");
            doc.lineGap(4);
            doc.opacity(1);

            doc.fontSize(h3).text(
                `Limite, Frontal / Norte / Noroeste: ${lote.limiteFrontal === '' ? '-' : lote.limiteFrontal}\nLímite, Derecho / Este / Sureste: ${lote.limiteDerecho === '' ? '-' : lote.limiteDerecho}\nLímite, Iquierdo / Sur / Sureste: ${lote.limiteIzquierdo === '' ? '-' : lote.limiteIzquierdo}\nLímite, Posterior / Oeste / Noroeste: ${lote.limitePosterior === '' ? '-' : lote.limitePosterior}\nUbicación del Lote: ${lote.ubicacionLote === '' ? '-' : lote.ubicacionLote}`,
                orgX + 340,
                doc.y + 5
            );

            doc.lineGap(0);

            doc.moveDown();

            let content = data.detalle.map((item, index) => {
                return [item.concepto, formatMoney(item.monto), item.metodo, item.banco, item.fecha]
            })

            const table1 = {
                //title: "CRONOGRAMA DE PAGOS MENSUALES VENTA AL CRÉDITO",
                subtitle: "DETALLE DE PAGOS ASOCIADOS",
                headers: ["Concepto", "Monto", "Método", "Banco", "Fecha"],
                rows: content.length === 0 ? [["No hay pagos asociados."]] : content
            };

            doc.table(table1, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h2),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
                x: orgX,
                y: doc.y + 10,
            });


            doc.end();

            return getStream.buffer(doc);
        } catch (error) {
            // return error.message;
            return "Se genero un error al generar el reporte.";
        }
    }

    async repTipoLote(req, sedeInfo, data) {
        try {

            const doc = new PDFDocument({
                font: 'Helvetica',
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = `DETALLE DE LOTES AL ${currentDate()}.pdf`

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let titleX = orgX + 150;
            let medioX = (doc.page.width - doc.options.margins.left - doc.options.margins.right) / 2;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            doc.image(path.join(__dirname, "..", "path/to/logo.png"), doc.x, doc.y, { width: 75, });

            doc.fontSize(h1).text(
                `${sedeInfo.nombreEmpresa}`,
                titleX,
                orgY,
                {
                    width: 250,
                    align: "center"
                }
            );

            doc.fontSize(h3).text(
                `RUC: ${sedeInfo.ruc}\n${sedeInfo.direccion}\nCelular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`,
                titleX,
                orgY + 17,
                {
                    width: 250,
                    align: "center",
                }
            );

            doc.fontSize(h2).text(
                "REPORTE DE LOTES",
                medioX,
                cabeceraY,
                {
                    width: 250,
                    align: "left"
                }
            );

            console.log(data.proyecto)

            doc.fontSize(h3).text(
                `PROYECTO: ${data.proyecto.nombre}`,
                orgX,
                doc.y + 25,
                {
                    width: 300,
                    align: "left",
                }
            );

            doc.fontSize(h3).text(
                `UBICACIÓN: ${data.proyecto.ubicacion}`,
                orgX,
                doc.y +5,
                {
                    width: 300,
                    align: "left",
                }
            );

            doc.fontSize(h3).text(
                `ÁREA: ${data.proyecto.area}  m²`,
                orgX,
                doc.y +5,
                {
                    width: 300,
                    align: "left",
                }
            );


            const estadoLote = req.query.estadoLote == 0 ? 'TODOS LOS LOTES'
                : req.query.estadoLote == 1 ? 'LOTES DISPONIBLES'
                    : req.query.estadoLote == 2 ? 'LOTES RESERVADOS'
                        : req.query.estadoLote == 3 ? 'LOTES VENDIDOS' : 'LOTES INACTIVOS';

            let totalCosto = 0;
            let totalPrecio = 0;
            let totalUtilidad = 0;

            let content = data.lista.map((item, index) => {
                let estado = item.estado === 1 ? 'DISPONIBLE'
                    : item.estado === 2 ? 'RESERVADO'
                        : item.estado === 3 ? 'VENDIDO' : 'INACTIVO';

                totalCosto = totalCosto + item.costo;
                totalPrecio = totalPrecio + item.precio;
                totalUtilidad = totalUtilidad + (item.precio + item.costo);

                return [++index, item.manzana + '\n' + item.lote, item.areaLote, estado, numberFormat(item.costo), numberFormat(item.precio), numberFormat(item.precio - item.costo)]
            })

            content.push(["", "", "", "TOTAL", numberFormat(totalCosto), numberFormat(totalPrecio), numberFormat(totalUtilidad)])

            const table1 = {
                subtitle: `RESUMEN ASOCIADOS AL FILTRO: ${estadoLote} AL ${currentDate()}`,
                headers: ["N°", "Lotes", "Area m²", "Estado", "Costo", "Venta", "Utilidad"],
                rows: content
            };

            doc.table(table1, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [30, 152, 70, 70, 70, 70, 70],
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right,
                x: orgX,
                y: doc.y + 10,
            });

            doc.end();

            return getStream.buffer(doc);

        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }
}

module.exports = RepLote;