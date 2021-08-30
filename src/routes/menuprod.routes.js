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

//insertar producto
router.post('/', (req, res)=>{
  const{ selectCat, selectSubcat, nameProduct, descriProduct, priceProduct, imgProduct}=req.body;
  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(
          `
          INSERT INTO producto_menu(prod_menu_cat_id, prod_menu_subcat_id, prod_menu_nombre,
               prod_menu_descripcion, prod_menu_precio, prod_menu_image)
               VALUES(?,?,?,?,?,?);
          `,[ selectCat, selectSubcat, nameProduct, descriProduct, priceProduct, imgProduct], (err, rows)=>{
              if(err) return res.send(err)
              return res.send('producto agregado con exito :)')
          }
      )
  })
})


module.exports = router;
