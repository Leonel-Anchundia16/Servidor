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