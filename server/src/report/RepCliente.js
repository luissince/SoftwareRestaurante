const path = require('path');
const PDFDocument = require("pdfkit-table");
const getStream = require('get-stream');
const { numberFormat, dateFormat, isFile } = require('../tools/Tools');

class RepCliente {

    async repGeneral(req, sedeInfo, data) {
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

            doc.info["Title"] = "REPORTE DE APORTACIONES DE LOS CLIENTES.pdf"

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let titleX = orgX + 150;
            let widthContent = doc.page.width - doc.options.margins.left - doc.options.margins.right;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            if (isFile(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo))) {
                doc.image(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo), orgX, orgY, { width: 75 });
            } else {
                doc.image(path.join(__dirname, "..", "path/to/noimage.jpg"), orgX, orgY, { width: 75 });
            }

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
                `${req.query.idCliente === "" ? "REPORTE DE CLIENTES" : "LISTA DE APORTACIONES"}`,
                doc.options.margins.left,
                cabeceraY,
                {
                    width: widthContent,
                    align: "center",
                }
            );

            doc.fontSize(h3).text(
                `CLIENTE: ${req.query.idCliente === "" ? "TODOS" : req.query.cliente}`,
                orgX,
                doc.y + 10,
                {
                    align: "left",
                }
            );

            doc.fontSize(h3).text(
                `PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`,
                orgX,
                doc.y + 5,
                {
                    width: 300,
                    align: "left",
                }
            );

            if (req.query.idCliente !== "") {
                let content = data.map((item, index) => {
                    return [++index,
                    item.fecha + "\n" + item.hora,
                    item.comprobante + "\n" + item.serie + "-" + item.numeracion,
                    item.detalle,
                    numberFormat(item.monto)];
                });

                const table = {
                    subtitle: "DETALLE",
                    headers: ["N°", "Fecha", "Comprobante", "Detalle", "Monto"],
                    rows: content
                };

                doc.table(table, {
                    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                    prepareRow: () => {
                        doc.font("Helvetica").fontSize(h3);
                    },
                    padding: 5,
                    columnSpacing: 5,
                    columnsSize: [30, 90, 162, 160, 90],
                    x: doc.x,
                    y: doc.y + 15,
                    width: doc.page.width - doc.options.margins.left - doc.options.margins.right
                });
            } else {

                let array = [];
                for (let item of data) {
                    if (array.filter(f => f.idCliente === item.idCliente).length === 0) {
                        array.push({
                            "idCliente": item.idCliente,
                            "documento": item.documento,
                            "informacion": item.informacion,
                            "ingresos": item.ingresos,
                            "ventas": item.ventas,
                        });
                    } else {
                        for (let newItem of array) {
                            if (newItem.idCliente === item.idCliente) {
                                let currenteObject = newItem;
                                currenteObject.ingresos += parseFloat(item.ingresos);
                                currenteObject.ventas += parseFloat(item.ventas);
                                break;
                            }
                        }
                    }
                }

                let total = 0;
                let content = array.map((item, index) => {
                    total += item.ingresos + item.ventas;
                    return [++index, item.documento + "\n" + item.informacion, numberFormat(item.ingresos + item.ventas)];
                });

                content.push(["", "SUMA TOTAL:", numberFormat(total)]);

                const table = {
                    subtitle: "DETALLE",
                    headers: ["N°", "Cliente", "Monto"],
                    rows: content
                };

                doc.table(table, {
                    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                    prepareRow: () => {
                        doc.font("Helvetica").fontSize(h3);
                    },
                    padding: 5,
                    columnSpacing: 5,
                    columnsSize: [30, 412, 90],
                    x: doc.x,
                    y: doc.y + 15,
                    width: doc.page.width - doc.options.margins.left - doc.options.margins.right
                });
            }

            doc.end();
            return getStream.buffer(doc);
        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    async repHistorial(req, sedeInfo, data) {
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

            doc.info["Title"] = "HISTORIAL DEL CLIENTE.pdf"

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let titleX = orgX + 150;
            let medioX = doc.page.width / 2;
            let widthContent = doc.page.width - doc.options.margins.left - doc.options.margins.right;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;

            if (isFile(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo))) {
                doc.image(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo), orgX, orgY, { width: 75 });
            } else {
                doc.image(path.join(__dirname, "..", "path/to/noimage.jpg"), orgX, orgY, { width: 75 });
            }

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
                "HISTORIAL DEL CLIENTE",
                doc.options.margins.left,
                cabeceraY,
                {
                    width: widthContent,
                    align: "center",
                }
            );

            doc.fill('#000').stroke('#000');
            doc.lineGap(4);
            doc.opacity(1);


            let filtroY = doc.y;

            doc.fontSize(h3).text(
                `N° de Documento: ${data.cliente.tipoDocumento + " - " + data.cliente.documento}\nInformación: ${data.cliente.informacion}\nDirección: ${data.cliente.direccion}`,
                orgX,
                doc.y + 10,
                {
                    align: "left",
                }
            );

            doc.fontSize(h3).text(
                `Celular: ${data.cliente.celular}\nTeléfono: ${data.cliente.telefono}\nEmail: ${data.cliente.email}`,
                medioX,
                filtroY + 10
            );

            doc.lineGap(0);

            let ventas = data.venta.map((item, index) => {
                return [
                    ++index,
                    item.fecha,
                    item.comprobante + "\n" + item.serie + "-" + item.numeracion,
                    numberFormat(item.total, item.codigo)
                ]
            })

            const ventasTabla = {
                subtitle: `Historial`,
                headers: ["N°", "FECHA", "COMPROBANTE", "TOTAL"],
                rows: ventas
            };

            doc.table(ventasTabla, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: () => {
                    doc.font("Helvetica").fontSize(h3);
                },
                padding: 5,
                columnSpacing: 5,
                columnsSize: [40, 172, 230, 90],//532
                width: (doc.page.width - doc.options.margins.left - doc.options.margins.right),
                x: orgX,
                y: doc.y + 15,

            });

            doc.end();
            return getStream.buffer(doc);
        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

    async repDeudas(req, sedeInfo, data) {
        try {
            const doc = new PDFDocument({
                font: 'Helvetica',
                layout: 'landscape',
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 40,
                    right: 40
                }
            });

            doc.info["Title"] = "LISTA DE DEUDAS"

            let orgX = doc.x;
            let orgY = doc.y;
            let cabeceraY = orgY + 70;
            let titleX = orgX + 230;
            let widthContent = doc.page.width - doc.options.margins.left - doc.options.margins.right;

            let h1 = 13;
            let h2 = 11;
            let h3 = 9;
            let h4 = 7;

            if (isFile(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo))) {
                doc.image(path.join(__dirname, "..", "path/company/" + sedeInfo.rutaLogo), orgX, orgY, { width: 75 });
            } else {
                doc.image(path.join(__dirname, "..", "path/to/noimage.jpg"), orgX, orgY, { width: 75 });
            }

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
                `LISTA DE DEUDAS POR CLIENTE `,
                doc.options.margins.left,
                cabeceraY,
                {
                    width: widthContent,
                    align: "center",
                }
            );

            doc.fontSize(h3).text(
                `${req.query.seleccionado ? "TODAS LA FECHAS" : req.query.frecuencia == 15 ? "FRECUENTA CADA 15 DEL MES" : "FRECUENTA CADA 30 DEL MES"}`,
                orgX,
                doc.y + 10,
                {
                    align: "left",
                }
            );

            doc.fontSize(h3).text(
                `PROYECTO: ${req.query.nombreProyecto}`,
                orgX,
                doc.y + 10,
                {
                    align: "left",
                }
            );

            let content = data.map((item, index) => {
                return [
                    ++index,
                    item.documento + " " + item.informacion,
                    item.lote,
                    item.nombre + "\n" + item.serie + "-" + item.numeracion,
                    item.numCuota == 1 ? item.numCuota + " COUTA" : item.numCuota + " COUTAS",
                    dateFormat(item.fechaPago),
                    numberFormat(item.total, item.codiso),
                    numberFormat(item.cobrado, item.codiso),
                    numberFormat(item.total - item.cobrado, item.codiso),
                ];
            });

            const table = {
                subtitle: "DETALLE",
                headers: ["N°", "Cliente", "Propiedad", "Comprobante", "Cuotas Pendientes", "Sig. Pago", "Total", "Cobrado", "Por Cobrar"],
                rows: content
            };

            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(h3),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    if (indexColumn === 8) {
                        doc.font("Helvetica").fontSize(h3).fillColor("red");
                    } else if (indexColumn === 7) {
                        doc.font("Helvetica").fontSize(h3).fillColor("green");
                    } else {
                        doc.font("Helvetica").fontSize(h3).fillColor("black");
                    }
                },
                align: "center",
                padding: 5,
                columnSpacing: 5,
                columnsSize: [30, 125, 80, 100, 80, 72, 75, 75, 75],//792-712
                x: doc.x,
                y: doc.y + 15,
                width: doc.page.width - doc.options.margins.left - doc.options.margins.right
            });

            doc.end();
            return getStream.buffer(doc);
        } catch (error) {
            return "Se genero un error al generar el reporte.";
        }
    }

}

module.exports = RepCliente;