const { Router } = require('express');
const router = Router();


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






module.exports = router;