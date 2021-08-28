const express = require('express')
const routes = express.Router()


// =========================================
// RUTAS PARA MENU
// =========================================
routes.get('/menu', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`SELECT * FROM producto_menu`, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})

routes.get('/menu-lista', (req, res) =>{
    req.getConnection( (err, conn) => {
        if (err) return res.send(err)
        
         conn.query(` SELECT prod_menu_id AS ID, prod_menu_nombre AS NOMBRE, 
                        prod_menu_precio AS PRECIO  
                        FROM producto_menu`, (err,rows) =>{
             if (err)return res.send(err) 
                 
             res.json(rows)

         })
    })
})


// =========================================
// RUTAS PARA CLIENTE
// =========================================
// routes.get('/cliente/ventas', (req, res) => {
//     req.getConnection((err, conn) => {
//         if (err) return res.send(err)

//         conn.query(`
//         SELECT 
//         cliente_id, concat  (cliente_nombre,' - ' ,cliente_apellido) AS 'nombres',  cliente_telefono, cliente_email ,det_orden_cantidad
//         FROM cliente, detalle_orden
//         GROUP BY cliente_id
//          `, (err, rows) => {
//             if (err) return res.send(err)

//             res.json(rows)
//         })
//     })
// })

routes.get('/cliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT cliente_id, cliente_cedula, cliente_nombre, cliente_apellido,  cliente_telefono, cliente_email ,cliente_fechanac
        FROM cliente;
         `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})


// =========================================
// RUTAS PARA EMPLEADO
// =========================================
routes.get('/empleado', (req, res) => {
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
routes.get('/empleado/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT 
        empleado.empl_id AS 'id',
        empleado.empl_nombre AS 'nombre',
        empleado.empl_apellidos AS 'apellido',
        empleado.empl_email AS 'correo',
        empleado.empl_telefono AS 'telefono',
        empleado.empl_fechanac AS 'fnacimiento'
        FROM empleado;
        `, (err, rows) => {
            if (err) return res.send(err)
            res.json(rows)
        })
    })
})

// insertar un Empleado 
routes.post('/insertar/empleado', (req, res)=>{
    const{name,namel,dat,tel,email,select}=req.body;
    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        INSERT INTO empleado(empl_nombre, empl_apellidos,
        empl_telefono , empl_fechanac, empl_email
        , empl_tipo_empl_id) 
        VALUES(?,?,?,?,?,?);
        `
        , [name,namel,tel,dat,email,select], (err, rows)=>{
            if(err) return res.send(err)
            return res.send('promocion added!')
        })
    })
})






// =========================================
// RUTAS PARA ORDENES
// =========================================


// interfaz de usuario 

routes.get('/ordenes/lista', (req, res) => {
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

// routes.post('/insertar/ordenes', (req, res) => {
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

// routes.delete('/eliminar/orden/:id', (req, res)=>{
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
// routes.put('/Actualizar/ordenes/:id', (req, res)=>{
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


routes.get('/ordenes_pen', (req, res) => {
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

routes.get('/ordenes_pen/cantidad', (req, res) => {
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
routes.get('/promociones', (req, res) => {
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
routes.get('/promociones-admin', (req, res) => {
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
routes.post('/insertar/promociones-admin', (req, res)=>{
    const{name, code, dateIn, dateOut, desc,descripcion}=req.body;
    let estado;
    const  valestado = () => {
        function addZero(x,n){
            while (x.toString().length < n) {
                x = "0" + x;
            }
            return x;
        }
        let date =  new Date();
        let current = addZero(date.getFullYear(),2)+'-'+addZero((date.getMonth()+1),2)+'-'+addZero(date.getDate(),2);
        return estado=current;
    }
    valestado();
    console.log(estado)

    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        INSERT INTO promocion(prom_code_promo, prom_fecha_inicio ,
        prom_fecha_fin , prom_descuento, 
        prom_estado,prom_descripcion ) 
        VALUES(?,?,?,?,?,?);
        `
        , [code,dateIn,dateOut,desc,estado,descripcion], (err, rows)=>{
            if(err) return res.send(err)
            return res.send('promocion added!')
        })
    })
})

// eliminar promocion
routes.delete('/eliminarpromo/:id', (req, res)=>{
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
routes.put('/Actualizar/promociones-admin/:id', (req, res)=>{
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


// =========================================
// RUTAS PARA RESUMEN ADMIN
// =========================================

//consulta de cantidad de clientes
routes.get('/resumencliente', (req, res) => {
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

routes.get('/resumenpedidos', (req, res) => {
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
routes.get('/resumenpedidosE', (req, res) => {
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
routes.get('/resumentabl_clientes', (req, res) => {
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
routes.get('/resumentabl/entregado', (req, res) => {
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
routes.get('/resumentabl/mas_vendido', (req, res) => {
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


// topclientes

routes.get('/ventas/topcliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT 
        cliente_id, concat  (cliente_nombre,' ' ,cliente_apellido) AS 'nombres',  cliente_telefono, cliente_email ,det_orden_cantidad
        FROM cliente, detalle_orden
        GROUP BY cliente_id
         `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})






// NO ELIMINAR

// routes.post('/', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('INSERT INTO books set ?', [req.body], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book added!')
//         })
//     })
// })

// routes.delete('/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('DELETE FROM books WHERE id = ?', [req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book excluded!')
//         })
//     })
// })

// routes.put('/:id', (req, res)=>{
//     req.getConnection((err, conn)=>{
//         if(err) return res.send(err)
//         conn.query('UPDATE books set ? WHERE id = ?', [req.body, req.params.id], (err, rows)=>{
//             if(err) return res.send(err)

//             res.send('book updated!')
//         })
//     })
// })

module.exports = routes