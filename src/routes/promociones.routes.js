const { Router } = require('express');
const { reset } = require('nodemon');
const router = Router();


// ===========================
// USUARIO
// ===========================
router.get('/getProms-active', (req, res) => {
  req.getConnection((err, connect) => {
    if(err){return err}

    connect.query(`
    SELECT
      prom_image as picture,
      prod_menu_nombre as name,
      prom_descripcion as description,
      prom_code_promo as code,
      prod_menu_precio as priceUnit,
      prom_descuento as descuento    
    FROM promocion
    INNER JOIN promocion_producto ON promo_pd_prom_id = prom_id
    INNER JOIN producto_menu ON prod_menu_id = promocion_producto.promo_pd_prod_menu_id
    WHERE prom_fecha_inicio < NOW() AND prom_fecha_fin>NOW()`, (err, resp) => {
      if(err){return err}

      return res.json(resp);
    })
  })
})


router.post('/validate=cDE', (req, res) => {
  const { code, prodinBolsa } = req.body;

  req.getConnection((err, conect) => {
    if (err) { return res.json({ state: false, alert: "Ocurrió un error inesperado, lo sentimos." }) }

    conect.query(`
    SELECT
      prom_descuento as descuento,
      promo_pd_prod_menu_id as id_producto
    FROM promocion
    INNER JOIN promocion_producto ON promo_pd_prom_id = prom_id
    WHERE prom_code_promo = ? AND prom_fecha_inicio < NOW() AND prom_fecha_fin > NOW()`, [code], (error, resp) => {

      if (error) { return res.json({ state: false, alert: "Ocurrió un error inesperado, lo sentimos." }) }

      if (resp.length === 0) {
        return res.json({ state: false, alert: "El cupón que ingresaste no es válido o caduco." });
      } else {
        let productosDesc = [];

        resp.map(row => {
          prodinBolsa.find(product => product.id === row.id_producto ? productosDesc.push(product) : null);
        })

        if (productosDesc.length === 0) {
          return res.json({ state: false, alert: "No contienes ningún producto en tu bolsa que aplique este cupón." })
        } else {
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

//comprobar que los codigos nuevos no esten en uso
router.get("/validate-code", (req, res) => {
  req.getConnection((err, connect) => {
    if(err){return err};

    connect.query(`SELECT prom_code_promo FROM promocion`, (err, resp) => {
      if(err){return res.send(err)}

      let codes = [];
      resp.map(code => codes.push(code.prom_code_promo))

      return res.json(codes);
    })
  })
})


// Ver promociones desde admin
router.get('/promociones-admin', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.send(err)

    conn.query(`
    SELECT
      prom_id,
      prod_menu_nombre, 
      prom_descuento, 
      prom_code_promo, 
      prom_fecha_inicio, 
      prom_fecha_fin,
      prom_descripcion
    FROM promocion 
    INNER JOIN promocion_producto ON promocion_producto.promo_pd_prom_id = prom_id
    INNER JOIN producto_menu ON producto_menu.prod_menu_id = promocion_producto.promo_pd_prod_menu_id
    GROUP BY prom_code_promo`, (err, rows) => {
      if (err) return res.send(err)

      res.json(rows)
    })
  })
})

router.delete('/dltpromo/:id', (req, res) => {
  const { id } = req.params
  req.getConnection((err, conn) => {
    if (err){ res.json({alerta: "No se puso establecer la conexión.", state:false }); throw err}

    conn.query(`SELECT promo_pd_id  FROM promocion_producto WHERE promo_pd_prom_id = ?`, [id], (err, rows) => {
        if (err){return res.send(err)};

        conn.query(
          'DELETE FROM promocion_producto WHERE promo_pd_id = ?', [rows[0].promo_pd_id], (err, resp) => {
            if (err){res.json({alerta: "¡Error! No encontramos resultados de este elemento.", state:false }); return res.send(err)}

            conn.query(
              'DELETE FROM promocion WHERE prom_id = ?', [id], (err, resp) => {
                if (err){res.json({alerta: "¡Error! La promoción no se pudo eliminar.", state:false }); return res.send(err)}

                return res.json({alerta: "Promoción Eliminada correctamente.", state: true})
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
router.post('/add-promo', (req, res) => {
  const { prod_menu, code, dateIn, dateOut, desc, descripcion, image_prom } = req.body;

  req.getConnection((err, conn) => {
    if (err) { return res.send("No se pudo realizar la conexión al servidor") }

    conn.query('START TRANSACTION;', (err, resp) => {
      if (err) { return res.send("Ocurrio un error inesperado al agregar la promoción") };

      conn.query(`INSERT INTO promocion(prom_code_promo, prom_fecha_inicio, prom_fecha_fin, prom_descuento, prom_descripcion, prom_image)
        VALUES(?,?,?,?,?,?);`, [code, dateIn, dateOut, desc, descripcion, image_prom], (error, resp) => {
        if (error) { conn.query('ROLLBACK;'); return res.send("Ocurrio un error inesperado al agregar la promoción") }

        conn.query('SELECT prom_id AS id_promo FROM promocion WHERE prom_code_promo = ?', [code], (err, resp) => {
          if (err) { conn.query('ROLLBACK;'); return res.send("Ocurrio un error inesperado al agregar la promoción") }

          const idNewProm = resp[0].id_promo;

          conn.query(`INSERT INTO promocion_producto(promo_pd_prod_menu_id, promo_pd_prom_id)
            VALUES(?, ?)`, [prod_menu, idNewProm], (err, resp) => {
            if (err) { conn.query('ROLLBACK;'); return res.send("Ocurrio un error inesperado al agregar la promoción") }

            conn.query('COMMIT;');
            return res.send("Promoción agregada satisfactoriamente.");

          })
        })
      })
    })
  })
})

//obtener la promocion para actualizar la data
router.put('/queryProm/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, connect) => {
    if (err) { return res.send("Ocurrio un error al buscar la promcoción seleccionada.") }

    connect.query(`
    SELECT
      prod_menu_id, 
      prom_descuento, 
      prom_code_promo, 
      prom_fecha_inicio, 
      prom_fecha_fin,
      prom_descripcion,
      prom_image
    FROM promocion 
    INNER JOIN promocion_producto ON promocion_producto.promo_pd_prom_id = prom_id
    INNER JOIN producto_menu ON producto_menu.prod_menu_id = promocion_producto.promo_pd_prod_menu_id
    WHERE prom_id = ?`, [id], (err, resp) => {
      if(err){return res.send("No pudimos obtener la información de la promocion, intenta nuevamente.")}

      return res.json(resp);
    })
  })
})

// actualizar promocion
router.put('/query/update/:id', (req, res) => {
  const { id } = req.params;
  const { prod_menu, code, dateIn, dateOut, desc, descProm, imgProm } = req.body;

  req.getConnection((err, connect) => {
    if (err){return res.send("¡Error! No se puedo establecer la conexión.")}

    connect.query(`UPDATE promocion_producto SET promo_pd_prod_menu_id = ${prod_menu} WHERE promo_pd_prom_id = ${id}`, (err, resp) => {
      if (err) {return res.send("¡Error! No se pudieron aplicar los cambios.")}
      
      connect.query(`UPDATE promocion SET 
        prom_descuento = ${parseFloat(desc)}, 
        prom_code_promo = "${code}",
        prom_fecha_inicio = "${dateIn}",
        prom_fecha_fin = "${dateOut}",
        prom_descripcion = "${descProm}",
        prom_image = "${imgProm}"
      WHERE prom_id = ?`, [id], (error, response) => {
        if (error) {return res.send("¡Error! No se pudieron aplicar los cambios.")}
          
        return res.send("Cambios guardados correctamente.");
      })
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