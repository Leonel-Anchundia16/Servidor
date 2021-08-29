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


module.exports = router;