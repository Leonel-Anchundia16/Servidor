const { Router } = require('express');
const router = Router();


// CARDS VENTAS
router.get('/details_resm_/sales', (req, res) => {
    let responses = [];

    req.getConnection((err, connect) => {
        if(err){return res.status(500).send(err)};

        connect.query(`SELECT 
            SUM( orden_total_orden ) as ingresos,
            EXTRACT( MONTH from orden.orden_fechahora ) as mes
        FROM orden
        WHERE orden_estado_order='Entregado' OR orden_estado_order='Servido' 
        AND YEAR(orden_fechahora) = YEAR(CURRENT_DATE())
        AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE())`, (err, resp) => {
            if(err){return res.status(500).send(err)};

            responses = [ ...responses, resp[0] ];
            connect.query(`SELECT
                prod_menu_nombre as nombre,
                SUM( det_orden_cantidad ) as cantidad
            from detalle_orden
            INNER JOIN producto_menu ON prod_menu_id = det_orden_prod_menu_id
            INNER JOIN orden ON orden_id = det_orden_orden_id
            WHERE YEAR(orden_fechahora) = YEAR(CURRENT_DATE())
                AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE())
            GROUP BY nombre ORDER BY det_orden_cantidad DESC
            LIMIT 1`, (err, resp) => {
                if(err){return res.status(500).send(err)};
                
                responses = [ ...responses, resp[0] ];
                return res.send(responses);
            })
        })
    })

} )


// clientes con mayor compra
router.get('/customers_plus/sales', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {return res.status(500).send(err)}

        conn.query(`
        SELECT
            CONCAT(cliente_nombre,' ' ,cliente_apellido) AS cliente,
            cliente_telefono as tel,
            cliente_email as email,
            COUNT(orden_id) AS to_orden
        FROM cliente
        inner join orden on cliente_id= orden_cliente_id
        GROUP BY cliente_id
        ORDER BY to_orden DESC
        LIMIT 5`, (err, rows) => {
            if (err) {return res.status(500).send(err)}

            return res.status(200).json(rows)
        })
    })
})


//ranking de productos con mas pedidos
router.get('/products_more_sales', (req, res) => {
    req.getConnection((err, connect) => {
        if(err){return res.status(500).send(err)};

        connect.query(`SELECT
            producto_menu.prod_menu_nombre as producto,
            SUM(detalle_orden.det_orden_cantidad) AS cantidad,
            SUM(det_orden_precio_total) AS ingresos
        FROM detalle_orden
        INNER JOIN producto_menu on producto_menu.prod_menu_id = detalle_orden.det_orden_prod_menu_id
        INNER JOIN orden on orden.orden_id = detalle_orden.det_orden_orden_id
        WHERE orden_estado_order='Entregado' OR orden_estado_order='Servido' 
        AND YEAR(orden_fechahora) = YEAR(CURRENT_DATE())
        AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE())
        GROUP BY producto ORDER BY Cantidad DESC LIMIT 10`, (err, resp) => {
            if(err){return res.status(500).send(err)};

            return res.status(200).json(resp);
        })
    })
})



module.exports = router;