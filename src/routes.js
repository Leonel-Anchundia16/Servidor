const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.send(`
  REST API - La Parrilla de Luchín <br/>
  <br/>
  <strong>CONTRIBUITORS:</strong><br/>
  - Andrés Moncayo Zambrano<br/>
  - Leonel Anchundia Lucas<br/>
  - Mendoza Pilligua Jonathan<br/>
  - Espinoza López Eddy<br/>
  - Delgado Alonso Pablo<br/>
  <br/>
  Fecha de Creación: <strong>31 de Agosto del 2021</strong>
  `);
})

// =========================================
// COMENTARIOS DEL USUARIO
// =========================================
router.post('/coments', (req, res) => {
    const { nombres, apellidos, correo, mensaje } = req.body;

    req.getConnection((err, conect) => {
        if(err) return res.send("Hubo un error inesperado al enviar este mensaje, inténtalo más tarde.");
        conect.query(`
        INSERT INTO comentario_user(com_user_fname, com_user_lname, com_user_email, com_asunto)
        VALUES (?, ?, ?, ?)`, [ nombres, apellidos, correo, mensaje ], (err, resp) => {
            if(err){
                console.log(err)
                return res.send("Tu mensaje no puedo ser enviado correctamente, inténtalo más tarde.");
            }
            return res.send("¡Mensaje enviado exitosamente!");
        })
    })
})

// =========================================
// RUTAS PARA CLIENTE
// =========================================
router.get('/cliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT cliente_id, concat  (cliente_nombre,' - ' ,cliente_apellido) AS 'nombres',  cliente_telefono, cliente_email ,det_orden_cantidad
        FROM cliente, detalle_orden;
         `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})


// =========================================
// RUTAS PARA EMPLEADO
// =========================================
router.get('/empleado', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
         SELECT empl_id,concat  (empl_nombre,' - ' ,empl_apellidos) AS 'nombres empleados', empl_tipo_empl_id, empl_email ,empl_fechanac ,empl_telefono
         FROM empleado;
        `, (err, rows) => {
            if (err) return res.send(err)
            res.json(rows)
        })
    })
})



// =========================================
// RUTAS PARA ORDENES
// =========================================


// interfaz de usuario 

router.get('/ordenes', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT orden_id, orden_empl_id, cliente_nombre, cliente_telefono , orden_total_orden, orden.orden_estado_order
        FROM orden, cliente;
        `, (err, rows) => {
            if (err) return res.send(err)
            res.json(rows)
        })
    })
})

/// INSERTAR UNA ORDEM

// router.post('/insertar/ordenes', (req, res) => {
//     req.getConnection((err, conn) => {
//         if (err) return res.send(err)
//         conn.query(
//             `
//             INSERT INTO orden(orden_cliente_id, orden_empl_id, orden_fechahora, orden_estado_order, orden_direccion_ubic, orden_direc_inf_adicional, orden_subtotal, orden_price_transporte, orden_total_orden) 
//               VALUES(2, null,'2021-08-12 16:44:21', 'Pendiente', "Calle 23 entre Av. 8-9", 'Frente a tienda Roja', 12.99, 3.00, 15.99);
//             `
//             , [req.body], (err, rows) => {
//                 if (err) return res.send(err)

//                 res.send('orden added!')
//             })
//     })
// })

// ELIMINAR ORDEN

// router.delete('/eliminar/orden/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//          conn.query(
//             `
//             DELETE FROM orden WHERE orden_id = ?
//             `
//          , [req.params.id], (err, rows)=>{
//              if(err) return res.send(err)

//              res.send('book excluded!')
//         })
//     })
// })

// actualizar ordenes
// router.put('/Actualizar/ordenes/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query(
//             `
//             UPDATE orden SET orden_fechahora = '2021-08-13 16:50:21', orden_estado_order = 'Pendiente',
//             orden_direccion_ubic = 'Calle 110 entre Av. 17-18', orden_direc_inf_adicional = 'Frente a tienda Moncayo'
//             WHERE orden.orden_id = ?;
//             `
//        , [req.body, req.params.id], (err, rows)=>{
//            if(err) return res.send(err)

//            res.send('book updated!')
//        })
//    })
// })


// interfaz de administracion


router.get('/ordenes_pen', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
        `
        SELECT
            orden.orden_id,
            detalle_orden.det_orden_infor_adic,
            orden.orden_total_orden
        from orden
        INNER JOIN detalle_orden on detalle_orden.det_orden_id = orden.orden_id
        WHERE orden.orden_estado_order="Pendiente"
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})

router.get('/ordenes_pen/cantidad', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
        `
        SELECT
			COUNT(orden.orden_id) as total_orden
        from orden
        WHERE orden.orden_estado_order="Pendiente";
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})



// =========================================
// RUTAS PARA PROMOCIONES
// =========================================
router.get('/promociones', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
        SELECT 
            prom_id as id, 
            prom_image as imageProm, 
            prod_menu_nombre as nameProduct, 
            prod_menu_precio as priceBefore, 
            prom_descuento as descuento, 
            prom_descripcion as descripcion, 
            prom_code_promo as code_promo 
        FROM promocion 
        INNER JOIN promocion_producto on promocion_producto.promo_pd_prom_id = promocion.prom_id 
        INNER JOIN producto_menu on producto_menu.prod_menu_id = promocion_producto.promo_pd_prod_menu_id 
        WHERE promocion.prom_estado = "Activo" 
        ORDER BY promocion.prom_fecha_inicio DESC
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})

// PROMOCIONES ADMINISTRACION 
// Ver promociones desde admin
router.get('/promociones-admin', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
        `
        SELECT
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


// insertar una promocion 
// router.post('/insertar/promociones-admin', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query(
//         `
//         INSERT INTO promocion(prom_code_promo, prom_fecha_inicio, prom_fecha_fin, prom_descuento, 
//         prom_estado, prom_descripcion) 
//         VALUES('111122223333','2021-08-12', '2021-08-17', 10, 'Activo','Aplica solo los jueves en el local');
//         `
//         , [req.body], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('promocion added!')
//         })
//     })
// })

// eliminar promocion
// router.delete('/eliminarpromo/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query(
//         `
//         DELETE FROM promocion WHERE prom_id = ?
//         `
//         , [req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book excluded!')
//         })
//     })
// })

// actualizar promocion
// router.put('/Actualizar/promociones-admin/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query(
//         `
//         UPDATE promocion SET prom_code_promo = '111122223334', prom_fecha_inicio = '2021-08-17 00:00:00', 
//         prom_fecha_fin = '2021-09-30 00:00:00', prom_descuento = '20', prom_estado= 'Activo',
//         prom_descripcion = 'Aplica solo los Viernes' WHERE promocion.prom_id = ?;
//         `
//         , [req.body, req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book updated!')
//         })
//     })
// })


// =========================================
// RUTAS PARA RESUMEN ADMIN
// =========================================

//consulta de cantidad de clientes
router.get('/resumencliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT 
                 COUNT(cliente.cliente_id) as total_clientes
                FROM cliente;
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

//consulta de cantidad de ordenes con cualquier tipo de estado

router.get('/resumenpedidos', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT 
         COUNT(orden.orden_id) as ordenes_totales
         from orden
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

//consulta de cantidad de pedidos entregados
router.get('/resumenpedidosE', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT 
        COUNT(orden.orden_id) as ordenes_entregadas
      from orden
      where orden_estado_order ="Entregado"
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

// //consulta de tabla de resumen de admin
router.get('/resumentabl_clientes', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            select 
           detalle_orden.det_orden_infor_adic  as Detalle_de_Orden,
           cliente.cliente_nombre as Nombre_Cliente,
          detalle_orden.det_orden_precio_total as Precio_Total,
        orden.orden_estado_order as Estado_Orden
       from orden
       inner JOIN cliente on orden.orden_cliente_id= cliente.cliente_id
       INNER JOIN detalle_orden on orden.orden_id = detalle_orden.det_orden_orden_id
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

// =========================================
// RUTAS PARA VENTAS
// =========================================

// precio total de estado entregado
router.get('/resumentabl/entregado', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT SUM(orden_total_orden)
    FROM orden
    WHERE (orden_estado_order='Entregado') 
    AND (YEAR(orden_fechahora) = YEAR(CURRENT_DATE()) AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE()));
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

// Produccto mas vendido
router.get('/resumentabl/mas_vendido', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT
          producto_menu.prod_menu_nombre as NOMBRE,
          SUM(detalle_orden.det_orden_cantidad) AS Cantidad,
          SUM(producto_menu.prod_menu_precio * detalle_orden.det_orden_cantidad) AS Ingresos
      FROM detalle_orden
      INNER JOIN producto_menu on producto_menu.prod_menu_id = detalle_orden.det_orden_prod_menu_id
      INNER JOIN orden on orden.orden_id = detalle_orden.det_orden_orden_id
      WHERE orden.orden_estado_order = "Entregado" 
      GROUP BY nombre
      ORDER BY Cantidad DESC
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});






// NO ELIMINAR

// router.post('/', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('INSERT INTO books set ?', [req.body], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book added!')
//         })
//     })
// })

// router.delete('/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('DELETE FROM books WHERE id = ?', [req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book excluded!')
//         })
//     })
// })

// router.put('/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('UPDATE books set ? WHERE id = ?', [req.body, req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book updated!')
//         })
//     })
// })

module.exports = router;