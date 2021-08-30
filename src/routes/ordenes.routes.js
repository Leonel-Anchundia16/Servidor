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


const addOrden = ( clienteData, products, precios, credentials ) => {
  const { id_cliente, direccion, textarea, } = clienteData;
  const { delivery, subtotales, total } = precios;
  const { connect, res, error } = credentials;
  const dateCurrent = dateTime();  


  connect.query(`INSERT INTO orden(orden_cliente_id, orden_fechahora, orden_estado_order, orden_direccion_ubic, orden_direc_inf_adicional, orden_subtotal, orden_price_transporte, orden_total_orden)
        VALUES(?, ?, "Pendiente", ?, ?, ?, ?, ?)`, [id_cliente, dateCurrent, direccion, textarea, subtotales, delivery, total], (err, resp) => {
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
            
            return addOrden(  {id_cliente: response[0].cliente_id, direccion, textarea}, products, precios, {connect , res}  );
          });

        } else { return addOrden(  {id_cliente: resp[0].cliente_id, direccion, textarea}, products, precios, {connect , res, error}  );}

      });
    })
  })
})


module.exports = router;