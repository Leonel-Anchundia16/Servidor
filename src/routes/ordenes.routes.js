const { Router } = require('express');
const router = Router();


const dateTime = () => {
  function addZero(x, n) {
    while (x.toString().length < n) {
      x = "0" + x;
    }
    return x;
  }
  let date = new Date();
  let current = addZero(date.getFullYear(), 2) + '-' + addZero((date.getMonth() + 1), 2) + '-' + addZero(date.getDate(), 2) + ' ' + addZero(date.getHours(), 2) + ':' + addZero(date.getMinutes(), 2) + ':' + addZero(date.getSeconds(), 2);
  return current;
}


const addOrden = ( clienteData, products, precios, credentials, estado ) => {
  const { id_cliente, direccion, textarea, } = clienteData;
  const { delivery, subtotales, total } = precios;
  const { connect, res, error } = credentials;
  const dateCurrent = dateTime();  


  connect.query(`INSERT INTO orden(orden_cliente_id, orden_fechahora, orden_estado_order, orden_direccion_ubic, orden_direc_inf_adicional, orden_subtotal, orden_price_transporte, orden_total_orden)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, [id_cliente, dateCurrent, estado, direccion, textarea, subtotales, delivery, total], (err, resp) => {
    if (err) { connect.query('ROLLBACK;'); return res.json(error); }


    connect.query(`SELECT orden_id FROM orden WHERE orden_cliente_id = ? AND orden_fechahora = ?`, [id_cliente, dateCurrent], (err, resp) => {
      const id_order = resp[0].orden_id;
      if (err) { connect.query('ROLLBACK;'); return res.json(error); }

      if (resp.length === 0) { connect.query('ROLLBACK;'); return res.json(error); }


      let errorsCont = 0;
      products.map(product => {
        const { id, price, quantity, inforAdd } = product;

        connect.query(`
              INSERT INTO detalle_orden(det_orden_orden_id , det_orden_prod_menu_id, det_orden_precio_total, det_orden_cantidad, det_orden_infor_adic )
              VALUES(?, ?, ?, ?, ?)`, [id_order, id, price * quantity, quantity, inforAdd], (err, res) => { err ? errorsCont = errorsCont + 1 : null })
      })

      if (errorsCont === 0) {
        connect.query('COMMIT;');
        return res.json({ state: true, send: "Tu pedido se ha realizado correctamente.", statusText: 200 });
      }

      connect.query('ROLLBACK;');
      return res.json(error);
    })
  });
}


router.post('/new=orden', (req, res) => {
  const { products, precios, dataCliente } = req.body;
  const { firstName, lastName, email, telefono, direccion, textarea } = dataCliente;
  const error = { state: false, send: "Ocurrió un error inesperado al realizar tu transacción, inténtalo de nuevo." };
  
  req.getConnection((err, connect) => {
    if (err) { return res.json(error) }

    connect.query('START TRANSACTION;', (err, resp) => {
      if (err) { connect.query("ROLLBACK;"); return red.json(error) }

      connect.query('SELECT cliente_id FROM cliente WHERE cliente_email = ?', [email], (err, resp) => {
        if (err) { return connect.query('ROLLBACK;') }

        if (resp.length === 0) {

          connect.query(`INSERT INTO cliente(cliente_nombre, cliente_apellido, cliente_telefono, cliente_email)
          VALUES(?, ?, ?, ?)`, [firstName, lastName, telefono, email], (err, resp) => {

            if (err) { connect.query('ROLLBACK;'); return res.json(error); }
          });

          connect.query("SELECT * FROM cliente WHERE cliente_email = ?", [email], (err, response) => {
            if (err) { connect.query('ROLLBACK;'); return res.json(error); }
            
            return addOrden(  {id_cliente: response[0].cliente_id, direccion, textarea}, products, precios, {connect , res}, "Pendiente"  );
          });

        } else { return addOrden(  {id_cliente: resp[0].cliente_id, direccion, textarea}, products, precios, {connect , res, error}, "Pendiente" ); }

      });
    })
  })
})


//VISTA ORDENES - lista de ordenes
router.get('/getOrders', (req, res)=>{
  req.getConnection((err, connect) => {
    if(err){throw err}

    connect.query(`SELECT
      orden_id as id,
      COUNT(det_orden_orden_id) as cant, 
      CONCAT(cliente_nombre," ",cliente_apellido) as cliente,
      cliente_telefono as telefono, 
      orden_fechahora as datetime, 
      orden_total_orden as total, 
      orden_estado_order as estado 
    FROM orden 
    INNER JOIN detalle_orden ON det_orden_orden_id = orden_id 
    INNER JOIN cliente ON cliente_id = orden_cliente_id GROUP BY datetime DESC`,  (err, resp) => {
      if(err){return res.send("Error 401")}
      
      return res.json(resp);
    })
  })
})


//VISTA ORDENES - MOSTRAR DETALLES DE ORDENES
router.put("/view/:id", (req, res) => {
  const {id} = req.params;
  
  req.getConnection((err, connect) => {
    if(err){throw err};

    connect.query(`SELECT
      orden_id as numOrden,
      orden_estado_order as estado,
      CONCAT(cliente_nombre,' ',cliente_apellido) as nombres,
      cliente_cedula as cedula,
      cliente_email as correo,
      cliente_telefono as telefono,
      orden_direccion_ubic as direccion,
      orden_direc_inf_adicional as infor,
      orden_subtotal as subtotales,
      orden_price_transporte as transporte,
      orden_total_orden as total
    FROM orden
    INNER JOIN cliente ON cliente_id = orden_cliente_id
    WHERE orden_id = ?`, [id], (err, resp) => {
      if(err){throw err};

      const dataCliente = {
        numOrden: resp[0].numOrden,
        estado: resp[0].estado,
        nombres: resp[0].nombres,
        cedula: resp[0].cedula,
        correo: resp[0].correo,
        telefono: resp[0].telefono, 
        direccion: resp[0].direccion,
        descDirecc: resp[0].infor
      };

      const totales = {
        subtotales: resp[0].subtotales,
        transporte: resp[0].transporte,
        totales: resp[0].total
      }

      connect.query(`SELECT
        det_orden_id as idDetalle,
        prod_menu_nombre as producto,
        det_orden_infor_adic as adicion,
        det_orden_cantidad as cantidad,
        prod_menu_precio as precio,
        det_orden_precio_total as subtotal
      FROM detalle_orden
      INNER JOIN producto_menu ON prod_menu_id = det_orden_prod_menu_id
      INNER JOIN orden ON orden_id = det_orden_orden_id
      WHERE orden_id = ?`, [id], (err, resp) => {
        if(err){throw err}

        const detalles = resp.map(row => {return row});
        
        return res.json( {cliente: dataCliente, totales, productos: detalles} )
      })
    })
  })
})


//NUEVA ORDEN DESDE ADMINISTRACIÓN
router.post('/new=orden-local', (req, res) => {
  const { products, precios, dataCliente } = req.body;
  const { firstName, lastName, email,nui, telefono, direccion, textarea, status } = dataCliente;
  const error = { state: false, send: "Ocurrió un error inesperado al realizar tu transacción, inténtalo de nuevo." };
  
  req.getConnection((err, connect) => {
    if (err) { return res.json(error) }

    connect.query('START TRANSACTION;', (err, resp) => {
      if (err) { connect.query("ROLLBACK;"); return red.json(error) }

      connect.query('SELECT cliente_id FROM cliente WHERE cliente_cedula = ?', [nui], (err, resp) => {
        if (err) { return connect.query('ROLLBACK;') }

        if (resp.length === 0) {

          connect.query(`INSERT INTO cliente(cliente_nombre, cliente_apellido, cliente_telefono, cliente_cedula)
          VALUES(?, ?, ?, ?)`, [firstName, lastName, telefono, nui], (err, resp) => {

            if (err) { connect.query('ROLLBACK;'); return res.json(error); }
          });

          connect.query("SELECT * FROM cliente WHERE cliente_cedula = ?", [nui], (err, response) => {
            if (err) { connect.query('ROLLBACK;'); return res.json(error); }
            
            return addOrden(  {id_cliente: response[0].cliente_id, direccion, textarea}, products, precios, {connect , res}, status  );
          });

        } else { return addOrden(  {id_cliente: resp[0].cliente_id, direccion, textarea}, products, precios, {connect , res, error}, status );}

      });
    })
  })
})


//ELIMINAR UNA ORDEN
router.delete('/dlt=order/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection( (err, connect) => {
    if(err){return res.status(500).send(err)};

    connect.query(`START TRANSACTION;`, (err, resp) => {
      if(err){ connect.query('ROLLBACK;'); return res.status(500).send(err); };
      
      connect.query(`SELECT det_orden_id FROM detalle_orden
      INNER JOIN orden ON orden_id = det_orden_orden_id
      WHERE orden.orden_id = ?`, [id], (err, resp) => {
        if(err){ connect.query('ROLLBACK;'); return res.status(500).send(err)};
        
        resp.map(response => 
          connect.query(`DELETE FROM detalle_orden WHERE det_orden_id = ?`, [ response.det_orden_id ], (err, resp) => {
            if(err){ connect.query('ROLLBACK;'); return res.status(500).send(err)};
          })  
        )

        connect.query('DELETE FROM orden WHERE orden_id = ?', [id], (err, resp) => {
          if(err){ connect.query('ROLLBACK;'); return res.status(500).send(err)};

          connect.query('COMMIT;');
          return res.status(200).send("done");
        })

      })

    })
  })

})


//CAMBIAR ESTADO DE ORDEN YA CONFIRMADA
router.put('/confirm/order/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection( (err, connect) => {
    if(err){return res.status(500).send(err)};
    
    connect.query(`UPDATE orden SET orden_estado_order = "Entregado" WHERE orden_id = ?`, [id], (err, resp) => {
      if(err){return res.status(500).send(err)};
      
      return res.status(200).send(true);
    })
  } )

})


//EDITAR INFORMACION DE PRODUCTOS DE LA ORDEN 
router.put('/update/order/list/:idOrder', (req, res) => {
  const { idOrder } = req.params;

  req.getConnection((err, connect) => {
    if(err){return res.status(500).send(err)};

    connect.query(`START TRANSACTION;`, (err, resp) => {
      if(err){return res.status(500).send(err)};

      req.body.map(obj => {
        const { id, infAdic, priceAdic } = obj;

        connect.query(`UPDATE detalle_orden SET det_orden_precio_total = ?, det_orden_infor_adic = ?  WHERE det_orden_id = ?`, [])
      })
    });
  })

})


module.exports = router;