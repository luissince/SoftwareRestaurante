const express = require('express');
const router = express.Router();
const tools = require('../tools/Tools');
const Conexion = require('../database/Conexion');

router.get('/list', async function(req, res){
    const conec = new Conexion()
    try{
        let lista = await conec.query(`SELECT idmoneda, nombre, codiso, simbolo, estado FROM moneda 
         WHERE 
         ? = 0
         OR
         ? = 1 and nombre like concat(?,'%')
         OR
         ? = 1 and codiso like concat(?,'%')
         LIMIT ?,?`, [
            parseInt(req.query.option),

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.option),
            req.query.buscar,

            parseInt(req.query.posicionPagina),
            parseInt(req.query.filasPorPagina)
        ])

        let resultLista = lista.map(function (item, index) {
            return {
                ...item,
                id: (index+1) + parseInt(req.query.posicionPagina)
            }
        });

        let total = await conec.query(`SELECT COUNT(*) AS Total FROM moneda`);

        res.status(200).send({"result": resultLista, "total": total[0].Total })

    }catch(error){
        console.log(error + ' es indefinido' )
        res.status(500).send("Error interno de conexión, intente nuevamente.")
    }
});

router.post('/add', async function (req, res){
    const conec =  new Conexion()
    let connection = null;
    try{
        connection = await conec.beginTransaction();
        await conec.execute(connection, 'INSERT INTO moneda (nombre, codiso, simbolo, estado) values (?,?,?,?)', [
            req.body.nombre,
            req.body.codiso,
            req.body.simbolo,
            req.body.estado
        ])

        await conec.commit(connection);
        res.status(200).send('Datos insertados correctamente')
        
    } catch (err) {
        if(connection != null){
            conec.rollback(connection);
        }
        res.status(500).send(connection);
    }
});

router.post('/update', async function(req, res) {
    const conec = new Conexion();
    let connection = null;

    try{

        connection = await conec.beginTransaction();
        await conec.execute(connection, 'UPDATE moneda SET nombre=?, codiso=?, simbolo=?, estado=? where idmoneda=?', [
            req.body.nombre,
            req.body.codiso,
            req.body.simbolo,
            req.body.estado,
            req.body.idmoneda
        ])

        await conec.commit(connection)

        res.status(200).send('Datos actulizados correctamente')
        // console.log(req.body)

    }catch (error) {
        if (connection != null) {
            conec.rollback(connection);
            
        }
        res.status(500).send(error);
        // console.log(error)
    }
})

router.get('/id', async function(req, res) {
    const conec = new Conexion(); 
    try{
        let result = await conec.query('SELECT * FROM moneda WHERE idmoneda = ?',[
            req.query.idmoneda,
        ]);

        if(result.length > 0){
            res.status(200).send(result[0]);
        }else{
            res.status(400).send( "Datos no encontrados" );
        } 

    } catch(error){
        res.status(500).send("Error interno de conexión, intente nuevamente.");
    }
    
});


module.exports = router;