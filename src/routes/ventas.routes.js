const { Router } = require('express');
const router = Router();


// precio total de estado entregado
// router.get('/resumentabl/entregado', (req, res) => {
//     req.getConnection((err, conn) => {
//         if (err) return res.send(err)

//         conn.query(
//             `
//             SELECT SUM(orden_total_orden)
//     FROM orden
//     WHERE (orden_estado_order='Entregado') 
//     AND (YEAR(orden_fechahora) = YEAR(CURRENT_DATE()) AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE()));
//         `, (err, rows) => {
//             if (err) return res.send(err)

//             res.json(rows)
//         })
//     })
// });

// Produccto mas vendido
router.get('/resumentabl/mas_vendido', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT
orden.orden_id,
producto_menu.prod_menu_nombre as nombre,
producto_menu.prod_menu_precio as precio,
COUNT(detalle_orden.det_orden_cantidad) as cantidad
from producto_menu
INNER JOIN detalle_orden on detalle_orden.det_orden_prod_menu_id =producto_menu.prod_menu_id
INNER JOIN orden on orden.orden_id = detalle_orden.det_orden_orden_id
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
});

//ingresos estimados
router.get('/ingresosmes', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)
        conn.query(`
        SELECT 
        EXTRACT(MONTH from orden.orden_fechahora) as mes,
        SUM(orden.orden_total_orden) as ingresos
        from orden
         `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})
// clientes con mayor compra

router.get('/ventas/topcliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT
        cliente_id,
        concat  (cliente_nombre,' ' ,cliente_apellido) AS 'nombres',
        cliente_telefono,
        cliente_email ,
        COUNT(orden_id) AS to_orden
        FROM cliente
        inner join orden on cliente_id= orden_cliente_id
        GROUP BY cliente_id
        ORDER BY to_orden DESC
         `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})
module.exports = router;