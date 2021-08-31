const { Router } = require('express');
const router = Router();


router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.send(err)

    conn.query(`
    SELECT 
      prod_menu_id as id,
      prod_menu_cat_id as categoria,
      prod_menu_subcat_id as subcategoria,
      prod_menu_nombre as title,
      prod_menu_descripcion as descripcion,
      prod_menu_precio as price,
      prod_menu_image as imageURL
    FROM producto_menu`, (err, rows) => {

      if (err) return res.send(errcs)

      return res.json(rows)
    })
  })
})



// administracion
router.get('/menulista', (req, res) =>{
  req.getConnection( (err, conn) => {
      if (err) return res.send(err)
      
       conn.query(` SELECT prod_menu_id AS id, prod_menu_nombre AS nombre, 
                      prod_menu_precio AS precio  
                      FROM producto_menu`, (err,rows) =>{
           if (err)return res.send(err) 
               
           res.json(rows)

       })
  })
})


module.exports = router;