const { Router } = require('express');
const router = Router();
const fileUpload = require('../middleware/UploadImages');
const fs = require('fs');
const path = require('path');


//metodo para agregar o modificar las imagenes
router.put('/changeimg/:id', fileUpload, (req, res) => {
  const { id } = req.params;

  req.getConnection((err, connect) => {
    if(err){return res.status(500).send(err)};
    
    if(req.file === undefined){
      return res.status(200).send(true);
    }

    const data = fs.readFileSync(path.join(__dirname, '../private/'+req.file.filename));
    connect.query(`UPDATE producto_menu SET prod_menu_image = ? WHERE prod_menu_id = ?`, [data, id], (err, resp) => {
      if(err){
        return res.status(500).send(err);
      }

      return res.status(200).send(true);      
    })
  })

})


// ======================================
//           USUARIO
// ======================================

//obtener todos los productos sin importar categoria
router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {return res.status(500).send(err)};

    conn.query(`
    SELECT 
      prod_menu_id as id,
      prod_menu_cat_id as categoria,
      prod_menu_subcat_id as subcategoria,
      prod_menu_nombre as title,
      prod_menu_descripcion as descripcion,
      prod_menu_precio as price,
      prod_menu_image as image
    FROM producto_menu ORDER BY title`, (err, rows) => {
      if (err) return res.send(err)
      
      let products = [];
      let newProducts = [];

      rows.map(row => {
        products = [...products, {
          id: row.id, 
          categoria: row.categoria,
          subcategoria: row.subcategoria,
          title: row.title,
          descripcion: row.descripcion,
          price: row.price
        }]
        fs.writeFileSync(path.join(__dirname, '../../public/' + row.id + '-' +row.title +"-parrilla-luchin.png"), row.image)
      })
      
      const imagesdir = fs.readdirSync(path.join(__dirname, '../../public/'));
      products.map(prod => 
        imagesdir.map(url => {
          let id_title = url.split("-", 2)
          if( prod.id === parseInt(id_title[0]) && prod.title === id_title[1] ){
            newProducts = [...newProducts, {...prod, imageURL: url}]
          }
        })
      )

      return res.json(newProducts);
    })
  })
});


//filtrado de productos por categoria
router.get('/get/:category', (req, res) => {
  const { category } = req.params;

  req.getConnection((err, conn) => {
    if (err) {return res.status(500).send(err)};

    conn.query(`SELECT 
      prod_menu_id as id,
      prod_menu_nombre as title,
      prod_menu_descripcion as descripcion,
      prod_menu_precio as price,
      prod_menu_image as image
    FROM producto_menu
    INNER JOIN categoria ON cat_id = prod_menu_cat_id
    WHERE cat_nombre = ? ORDER BY price ASC`, [category], (err, rows) => {
      if (err) {return res.status(500).send(err)};
      
      let products = [];
      let newProducts = [];

      rows.map(row => {
        products = [...products, {
          id: row.id, 
          title: row.title,
          descripcion: row.descripcion,
          price: row.price
        }]
        fs.writeFileSync(path.join(__dirname, '../../public/' + row.id + '-' +row.title +"-parrilla-luchin.png"), row.image)
      })
      
      const imagesdir = fs.readdirSync(path.join(__dirname, '../../public/'));
      products.map(prod => 
        imagesdir.map(url => {
          let id_title = url.split("-", 2)
          if( prod.id === parseInt(id_title[0]) && prod.title === id_title[1] ){
            newProducts = [...newProducts, {...prod, imageURL: url}];
          };
        })
      )

      return res.status(200).json(newProducts);
    });

  })

})


// ======================================
//           ADMINISTRACION
// ======================================

router.get('/menulista', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.send(err)

    conn.query(`SELECT
      prod_menu_id AS id, 
      categoria.cat_nombre AS categoria,
      prod_menu_nombre AS nombre,
      prod_menu_descripcion AS descripcion,
      prod_menu_precio AS precio
    FROM producto_menu
    INNER JOIN categoria on producto_menu.prod_menu_cat_id = categoria.cat_id
    ORDER BY categoria`, (err, rows) => {
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
  
  req.getConnection((err, conn) => {
    if (err){ return res.status(500).send(err)}

    conn.query(`
      INSERT INTO producto_menu(prod_menu_cat_id, prod_menu_subcat_id, prod_menu_nombre, prod_menu_descripcion, prod_menu_precio)
      VALUES(?,?,?,?,?)`
    , [selectCat, selectSubcat !== "" ? selectSubcat : null, nameProduct, descProduct, priceProduct, imgProduct], (err, rows) => {
        if (err){return res.status(500).send(err)}
        
        conn.query(`SELECT prod_menu_id FROM producto_menu WHERE prod_menu_cat_id = ${selectCat} AND prod_menu_nombre = "${nameProduct}" `, (error, resp) => {
          if (error){return res.status(500).send(error)}

          return res.status(200).json({id: resp[0].prod_menu_id});
        })
      }
    )
  })
})


// ---------- ACTUALIZAR PRODUCTO DEL MENU-----------------
router.get('/act_prod_menu/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) {return res.status(500).send(err)}

    conn.query(`SELECT 
      prod_menu_id as id,
      prod_menu_cat_id as categoria,
      prod_menu_subcat_id as subcategoria,
      prod_menu_nombre as title,
      prod_menu_descripcion as descripcion,
      prod_menu_precio as price,
      prod_menu_image as imagen
    FROM producto_menu WHERE prod_menu_id = ?`, [id], (err, row) => {
      if (err) {return res.status(500).send(err)}

      fs.writeFileSync(path.join(__dirname, '../../public/' + row[0].id + '-' +row[0].title +"-parrilla-luchin.png"), row[0].imagen)
      
      const imagesdir = fs.readdirSync(path.join(__dirname, '../../public/'));
      const producto = {
        id: row[0].id,
        categoria: row[0].categoria,
        subcategoria: row[0].subcategoria,
        title: row[0].title,
        descripcion: row[0].descripcion,
        price: row[0].price,
        imagen: imagesdir.find(url => row[0].id === parseInt(url.split("-", 1)) )
      }

      return res.status(200).json(producto);
    })
  })
});


router.put('/upd_inform__producto/:idProd', (req, res) => {
  const { idProd } = req.params;
  const { nameProduct, selectCat, selectSubcat, priceProduct, descProduct } = req.body;

  req.getConnection((err, connect) => {
    if(err){return res.status(500).send(err)};

    connect.query(`UPDATE producto_menu SET
      prod_menu_cat_id = ?,
      prod_menu_subcat_id = ?,
      prod_menu_nombre = ?,
      prod_menu_descripcion = ?,
      prod_menu_precio = ?
    WHERE prod_menu_id = ?`, 
    [ selectCat, selectSubcat, nameProduct, descProduct, priceProduct, idProd ], (err, resp) => {
      if(err){return res.status(500).send(err)};

      return res.status(200).send(true);
    })
  })
});


module.exports = router;