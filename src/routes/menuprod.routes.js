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
    FROM producto_menu ORDER BY title`, (err, rows) => {

      if (err) return res.send(errcs)

      return res.json(rows)
    })
  })
})



// administracion
router.get('/menulista', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.send(err)

    conn.query(`SELECT
        producto_menu.prod_menu_id AS id, 
        categoria.cat_nombre AS categoria,
        producto_menu.prod_menu_nombre AS nombre,
        producto_menu.prod_menu_descripcion AS descripcion,
        producto_menu.prod_menu_precio AS precio
      FROM producto_menu
      INNER JOIN categoria on producto_menu.prod_menu_cat_id = categoria.cat_id
      ORDER BY id`, (err, rows) => {
      if (err) return res.send(err)

      res.json(rows)

    })
  })
})

//obtener categorias
router.get('/getCat', (req, res) => {
  req.getConnection((err, connect) => {
    if (err) { throw err };

    connect.query(`SELECT cat_id as id, cat_nombre as name FROM categoria`, (error, response) => {
      if (error) { return res.send("Ocurrio un problema interno") };

      return res.json(response);
    })
  })
})

//obtener subcategorias
router.post('/getSubCat', (req, res) => {
  const { id } = req.body;

  req.getConnection((err, connect) => {
    if (err) { throw err };

    connect.query(`SELECT subcat_id as id, subcat_nombre as name FROM subcategoria WHERE subcat_categoria = ?`, [id], (error, response) => {
      if (error) { return res.send("Ocurrio un problema interno") };

      return res.json(response);
    })
  })
})


//insertar producto
router.post('/insertar/product', (req, res) => {
  const { selectCat, selectSubcat, nameProduct, descProduct, priceProduct, imgProduct } = req.body;
  console.log(selectSubcat)

  req.getConnection((err, conn) => {
    if (err) return res.send(err)
    conn.query(`
      INSERT INTO producto_menu(prod_menu_cat_id, prod_menu_subcat_id, prod_menu_nombre, prod_menu_descripcion, prod_menu_precio, prod_menu_image)
      VALUES(?,?,?,?,?,?);`
    , [selectCat, selectSubcat !== "" ? selectSubcat : null, nameProduct, descProduct, priceProduct, imgProduct], (err, rows) => {
        if (err) return res.send(err)

        return res.send('Producto agregado exitosamente.')
      }
    )
  })
})


module.exports = router;