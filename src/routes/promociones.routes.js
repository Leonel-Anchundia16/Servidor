const { Router } = require('express');
const router = Router();


// ===========================
// USUARIO
// ===========================
router.post('/validate=cDE', (req, res) => {
  const { code, prodinBolsa } = req.body;

  req.getConnection((err, conect) => {
    if(err){return res.json({state: false, alert: "Ocurrió un error inesperado, lo sentimos."})}

    conect.query(`
    SELECT
      prom_descuento as descuento,
      promo_pd_prod_menu_id as id_producto
    FROM promocion
    INNER JOIN promocion_producto ON promo_pd_prom_id = prom_id
    WHERE prom_code_promo = ? AND prom_estado = "Activo"`, [ code ], (error, resp) => {

      if(error){return res.json({state: false, alert: "Ocurrió un error inesperado, lo sentimos."})}

      if(resp.length === 0){
        return res.json({state: false, alert: "El cupón que ingresaste no es válido o caduco."});
      }else{
        let productosDesc = [];

        resp.map(row => {
          prodinBolsa.find(product => product.id === row.id_producto ? productosDesc.push(product) : null);
        })

        if(productosDesc.length === 0){
          return res.json({state: false, alert: "No contienes ningún producto en tu bolsa que aplique este cupón."})
        }else{
          return res.json({
            state: true, 
            alert: "Cupón canjeado satisfactoriamente.",
            productAplica: productosDesc,
            desc: resp[0].descuento
          });
        }
      }
    })
  })
})


// ===========================
// ADMIN
// ===========================

// Ver promociones desde admin
router.get('/promociones-admin', (req, res) => {
  req.getConnection((err, conn) => {
      if (err) return res.send(err)

      conn.query(
      `
      SELECT
          prom_id,
          prod_menu_nombre, 
          prom_descuento, 
          prom_code_promo, 
          prom_estado, 
          prom_fecha_inicio, 
          prom_fecha_fin, prom_descripcion
      FROM producto_menu 
      INNER JOIN promocion_producto ON producto_menu.prod_menu_id = promocion_producto.promo_pd_prod_menu_id
      INNER JOIN promocion ON promocion_producto.promo_pd_prom_id = promocion.prom_id;
      `, (err, rows) => {
          if (err) return res.send(err)

          res.json(rows)
      })
  })
})

router.delete('/dltpromo/:id',(req,res )=>{
  const{id}=req.params
  req.getConnection((err,conn)=>{
    if(err) return res.send(err)
      conn.query(
        `
        SELECT promo_pd_id  FROM promocion_producto WHERE promo_pd_prom_id = ?
        `
        ,[id], (err, rows)=>{
          if(err) return res.send(err)
          conn.query(
            'DELETE FROM promocion_producto WHERE promo_pd_id = ?',[rows[0].promo_pd_id],(err,resp)=>{
                if(err) return res.send(err)
      
                conn.query(
                  'DELETE FROM promocion WHERE prom_id = ?',[id],(err,resp)=>{
                    if(err) return res.send(err)
                    res.send('enviado')
                  }
                )
            }
          )
        }
      )
   } 
  )
})


// insertar una promocion 
// router.post('/insertar/promociones-admin', (req, res)=>{
//   const{product, code, dateIn, dateOut, desc,descripcion}=req.body;
//   req.getConnection((err, conn)=>{
//       if(err) return res.send(err)
//       conn.query(
//       `
//       INSERT INTO promocion(prom_code_promo, prom_fecha_inicio ,
//       prom_fecha_fin , prom_descuento, 
//       prom_estado,prom_descripcion ) 
//       VALUES(?,?,?,?,?,?);
//       `
//       , [code,dateIn,dateOut,desc,descripcion], (err, rows)=>{
//           if(err) return res.send(err)
//           conn.query(
//             `
//             SELECT prom_id FROM promocion WHERE prom_code = ?
//             `
//             ,(err,resp)=>{
//               if(err) return res.send(err)
//               conn.query(
//                 `
//                 INSERT promocion_product(prm_pd_proo_id, prm_pd_product_id) VALUES (prom_id, prod_id)
//                 `
//                 ,(err,resp)=>{
//                   if(err) return res.send(err)
//                   res.send('Agregada')
//                 }
//               )  

//             }
//           )
//       })
//   })
// })


router.post('/insertar/promociones-admin', (req, res)=>{
  const{product, code, dateIn, dateOut, desc,descripcion}=req.body;
  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(
      `
      INSERT INTO promocion(prom_code_promo, prom_fecha_inicio ,
      prom_fecha_fin , prom_descuento, 
      prom_estado,prom_descripcion ) 
      VALUES(?,?,?,?,?,?);
      `
      , [code,dateIn,dateOut,desc,descripcion], (err, rows)=>{
          if(err) return res.send(err)
          return res.send('promocion added!')
      })
  })
})


// eliminar promocion
router.delete('/eliminarpromo/:id', (req, res)=>{
  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(
      `
      DELETE FROM promocion WHERE prom_id = ?
      `
      , [req.params.id], (err, rows)=>{
          if(err) return res.send(err)

          res.send('Promocion Eliminada!')
      })
  })
})


// actualizar promocion
router.put('/actualizar/promociones-admin/:id', (req, res)=>{
  const{name, code, dateIn, dateOut, desc,descripcion,id}=req.body;
  

  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(
      `
      UPDATE promocion SET prom_code_promo = ?, prom_fecha_inicio = ?, 
      prom_fecha_fin = ?, prom_descuento = ?,
      prom_descripcion = ? WHERE promocion.prom_id = ?;
      `
      , [code,dateIn,dateOut,desc,descripcion,id], (err, rows)=>{
          if(err) return res.send(err)

          res.send('promocion actualizada!')
      })
  })
})



// PARA SELECCIONAR UN PRODUCTO PARA LA PROMO

router.get('/productos', (req, res) => {
  req.getConnection((err, conn) => {
      if (err) return res.send(err)

      conn.query(
      `
      SELECT  prod_menu_id,prod_menu_nombre
      FROM  producto_menu;
      `, (err, rows) => {
          if (err) return res.send(err)

          res.json(rows)
      })
  })
})

module.exports = router;