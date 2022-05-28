const xl = require('excel4node');
const { formatMoney, dateFormat } = require('../tools/Tools');

async function generateExcel(req, sedeInfo, data) {
    try {
        const wb = new xl.Workbook();

        let ws = wb.addWorksheet('Sheet 1');

        const styleTitle = wb.createStyle({
            alignment: {
                horizontal: 'center'
            },
            font: {
                color: '#000000',
                size: 12,
            },
        });

        const styleHeader = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleTableHeader = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                bold: true,
                color: '#000000',
                size: 12,
            },
           
        });

        const styleBody = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleBodyInteger = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            }
        });

        const styleBodyFloat = wb.createStyle({
            alignment: {
                horizontal: 'left'
            },
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0.00;',
        });

        ws.column(1).setWidth(15);
        ws.column(2).setWidth(15);
        ws.column(3).setWidth(20);
        ws.column(4).setWidth(20);
        ws.column(5).setWidth(18);
        ws.column(6).setWidth(15);
        ws.column(7).setWidth(15);
        ws.column(8).setWidth(18);

        ws.cell(1, 1, 1, 8, true).string(`${sedeInfo.nombreEmpresa}`).style(styleTitle);
        ws.cell(2, 1, 2, 8, true).string(`RUC: ${sedeInfo.ruc}`).style(styleTitle);
        ws.cell(3, 1, 3, 8, true).string(`${sedeInfo.direccion}`).style(styleTitle);
        ws.cell(4, 1, 4, 8, true).string(`Celular: ${sedeInfo.celular} / Telefono: ${sedeInfo.telefono}`).style(styleTitle);

        ws.cell(6, 1, 6, 8, true).string(`REPORTE GENERAL DE VENTAS`).style(styleTitle);
        ws.cell(7, 1, 7, 8, true).string(`PERIODO: ${dateFormat(req.query.fechaIni)} al ${dateFormat(req.query.fechaFin)}`).style(styleTitle);

        ws.cell(9, 1).string(`Comprobante(s):`).style(styleHeader);
        ws.cell(9, 2).string(`${req.query.idComprobante === '' ? "TODOS" : req.query.comprobante}`).style(styleHeader);
        
        ws.cell(10, 1).string(`Cliente(s):`).style(styleHeader);
        ws.cell(10, 2).string(`${req.query.idCliente === '' ? "TODOS" : req.query.cliente}`).style(styleHeader);
        
        ws.cell(11, 1).string(`Vendedor(s):`).style(styleHeader);
        ws.cell(11, 2).string(`${req.query.idUsuario === '' ? "TODOS" : req.query.usuario}`).style(styleHeader);

        ws.cell(9, 5).string(`Tipo(s):`).style(styleHeader);
        ws.cell(9, 6).string(`${req.query.tipoVenta === 0 ? "TODOS" : req.query.tipo}`).style(styleHeader);

        const header = ["Fecha", "N° Documento","Información", "Comprobante", "Serie y Numeración","Tipo", "Estado", "Importe","Anulado"];

        header.map((item, index) => ws.cell(13, 1+index).string(item).style(styleTableHeader));

        data.map((item, index) => {
            ws.cell(14+index, 1).string(item.fecha).style(styleBody)
            ws.cell(14+index, 2).number(parseInt(item.documento)).style(styleBodyInteger)
            ws.cell(14+index, 3).string(item.informacion).style(styleBody)
            ws.cell(14+index, 4).string(item.comprobante).style(styleBody)
            ws.cell(14+index, 5).string(item.serie+"-"+item.numeracion).style(styleBody)
            ws.cell(14+index, 6).string(item.tipo).style(styleBody)
            ws.cell(14+index, 7).string(item.estado).style(styleBody)
            if(item.estado === "ANULADO"){
                ws.cell(14+index, 8).number(0).style(styleBodyFloat)
                ws.cell(14+index, 9).number(parseFloat(formatMoney(item.total))).style(styleBodyFloat)
            }else{
                ws.cell(14+index, 8).number(parseFloat(formatMoney(item.total))).style(styleBodyFloat)
                ws.cell(14+index, 9).number(0).style(styleBodyFloat)
            }            
        });

        return wb.writeToBuffer();
    } catch (error) {
        return "Error en generar el excel.";
    }
}

module.exports = { generateExcel }