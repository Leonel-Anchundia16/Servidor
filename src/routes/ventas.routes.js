const { Router } = require('express');
const router = Router();


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







module.exports = router;