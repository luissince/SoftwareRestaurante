const Conexion = require("../database/Conexion");
const { currentDate, currentTime } = require("../tools/Tools");
const conec = new Conexion();

class Categoria {
  async list(req) {
    try {
      let lista = await conec.query(
        `SELECT 
            m.idCategoria,
            m.nombre,
            p.nombre as proyecto,
            DATE_FORMAT(m.fecha,'%d/%m/%Y') as fecha,
            m.hora
            FROM categoria AS m INNER JOIN proyecto AS p
            ON m.idProyecto = p.idProyecto
            WHERE
            ? = 0 AND p.idProyecto = ?
            OR
            ? = 1 AND p.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')
            LIMIT ?,?`,
        [
          parseInt(req.query.opcion),
          req.query.idProyecto,

          parseInt(req.query.opcion),
          req.query.idProyecto,
          req.query.buscar,

          parseInt(req.query.posicionPagina),
          parseInt(req.query.filasPorPagina),
        ]
      );

      let resultLista = lista.map(function (item, index) {
        return {
          ...item,
          id: index + 1 + parseInt(req.query.posicionPagina),
        };
      });

      let total = await conec.query(
        `SELECT COUNT(*) AS Total     
            FROM categoria AS m INNER JOIN proyecto AS p
            ON m.idProyecto = p.idProyecto
            WHERE
            ? = 0 AND p.idProyecto = ?
            OR
            ? = 1 AND p.idProyecto = ? AND m.nombre LIKE CONCAT(?,'%')`,
        [
          parseInt(req.query.opcion),
          req.query.idProyecto,

          parseInt(req.query.opcion),
          req.query.idProyecto,
          req.query.buscar,
        ]
      );

      return { result: resultLista, total: total[0].Total };
    } catch (error) {
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async id(req) {
    try {
      let result = await conec.query(
        "SELECT * FROM categoria WHERE idCategoria = ?",
        [req.query.idCategoria]
      );

      if (result.length > 0) {
        return result[0];
      } else {
        return "Datos no encontrados";
      }
    } catch (error) {
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async add(req) {
    let connection = null;
    try {
      connection = await conec.beginTransaction();

      let result = await conec.execute(
        connection,
        "SELECT idCategoria FROM categoria"
      );
      let idCategoria = "";
      if (result.length != 0) {
        let quitarValor = result.map(function (item) {
          return parseInt(item.idCategoria.replace("MZ", ""));
        });

        let valorActual = Math.max(...quitarValor);
        let incremental = valorActual + 1;
        let codigoGenerado = "";
        if (incremental <= 9) {
          codigoGenerado = "MZ000" + incremental;
        } else if (incremental >= 10 && incremental <= 99) {
          codigoGenerado = "MZ00" + incremental;
        } else if (incremental >= 100 && incremental <= 999) {
          codigoGenerado = "MZ0" + incremental;
        } else {
          codigoGenerado = "MZ" + incremental;
        }

        idCategoria = codigoGenerado;
      } else {
        idCategoria = "MZ0001";
      }

      await conec.execute(
        connection,
        `INSERT INTO categoria(
            idCategoria,
            nombre,
            idProyecto,
            fecha,
            hora,
            fupdate,
            hupdate,
            idUsuario) 
            VALUES(?,?,?,?,?,?,?,?)`,
        [
          idCategoria,
          req.body.nombre,
          req.body.idProyecto,
          currentDate(),
          currentTime(),
          currentDate(),
          currentTime(),
          req.body.idUsuario,
        ]
      );

      await conec.commit(connection);
      return "insert";
    } catch (error) {
      if (connection != null) {
        await conec.rollback(connection);
      }
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async edit(req) {
    let connection = null;
    try {
      connection = await conec.beginTransaction();

      await conec.execute(
        connection,
        `UPDATE categoria SET
            nombre = ?,
            idProyecto = ?,
            fupdate = ?,
            hupdate = ?,
            idUsuario = ?
            WHERE idCategoria  = ?`,
        [
          req.body.nombre,
          req.body.idProyecto,
          currentDate(),
          currentTime(),
          req.body.idUsuario,
          req.body.idCategoria,
        ]
      );

      await conec.commit(connection);
      return "update";
    } catch (error) {
      if (connection != null) {
        await conec.rollback(connection);
      }
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async delete(req) {
    let connection = null;
    try {
      connection = await conec.beginTransaction();

      let producto = await conec.execute(
        connection,
        `SELECT * FROM producto WHERE idCategoria = ?`,
        [req.query.idCategoria]
      );

      if (producto.length > 0) {
        await conec.rollback(connection);
        return "No se puede eliminar la categoria ya que esta ligada a un producto.";
      }

      await conec.execute(
        connection,
        `DELETE FROM categoria WHERE idCategoria  = ?`,
        [req.query.idCategoria]
      );

      await conec.commit(connection);
      return "delete";
    } catch (error) {
      if (connection != null) {
        await conec.rollback(connection);
      }
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async listcombo(req) {
    try {
      const result = await conec.query(
        "SELECT idCategoria,nombre FROM categoria WHERE idProyecto = ?",
        [req.query.idProyecto]
      );
      return result;
    } catch (error) {
      return "Error interno de conexión, intente nuevamente.";
    }
  }

  async trasladar(req) {
    let connection = null;
    try {
      connection = await conec.beginTransaction();

      const categoria = await conec.execute(connection,"SELECT * FROM categoria WHERE  idCategoria = ? and idProyecto = ?",[
        req.query.idCategoria,
        req.query.idProyecto
      ])

      await  conec.execute(connection, 'update categoria set idProyecto = ? where idCategoria = ?',[
        req.query.idProyectoTrasladar,
        req.query.idCategoria,
      ])

      const productos = await conec.execute(connection,"select * from producto where idCategoria = ?",[
        categoria[0].idCategoria
      ])
      

      for(const producto of productos){

        const venta = await conec.execute(connection, `select * from venta as v 
        inner join ventaDetalle as vd 
        on vd.idVenta = v.idVenta 
        where vd.idProducto = ?`,[
            producto.idProducto
        ])

        if(venta.length != 0){

            await conec.execute(connection,`update venta set idProyecto = ? where idVenta = ?`,[
                req.query.idProyectoTrasladar,
                venta[0].idVenta
            ])

            // const alta = await conec.execute(connection,`select * from alta where idCliente = ?`,[
            //     venta[0].idCliente,
            // ])

            await conec.execute(connection,`update alta set idProyecto = ? where idCliente = ?`,[
                req.query.idProyectoTrasladar,
                venta[0].idCliente,
            ])
    
            const cobros = await conec.execute(connection, `select * from cobro where idProcedencia = ?`,[
                venta[0].idVenta
            ])
            
    
            await conec.execute(connection, `update cobro set idProyecto = ? where idProcedencia = ?`,[
                req.query.idProyectoTrasladar,
                venta[0].idVenta
            ])
    
            for(const cobro of cobros){
                await conec.execute(connection, `update notaCredito set idProyecto = ?  where idCobro = ?`,[
                    req.query.idProyectoTrasladar,
                    cobro.idCobro
                ])
            }
        }

      }

      await conec.commit(connection);
      return "update";
    } catch (error) {
        console.log(error)
      if (connection != null) {
        await conec.rollback(connection);
      }
      return "Error interno de conexión, intente nuevamente.";
    }
  }
}

module.exports = Categoria;
