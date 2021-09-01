const { Router, response } = require('express');
const router = Router();


router.get('/resumen=all', (req, res) => {
    let resumenCards = [];

    req.getConnection((err, connect) => {
        if (err) { return res.send("Server no response now") }

        connect.query(`SELECT COUNT(cliente.cliente_id) as total_clientes FROM cliente`, (err, response) => {
            if (err) { return res.send("Ocurrio un error inesperado") };

            resumenCards = { ...resumenCards, clientes: response[0].total_clientes }
            connect.query(`SELECT COUNT(orden.orden_id) as ordenes_entrg from orden
            where orden_estado_order ="Entregado"`, (err, resp) => {
                if (err) { return res.send("Ocurrio un error inesperado") };

                resumenCards = { ...resumenCards, entregas: resp[0].ordenes_entrg }
                connect.query(`SELECT COUNT(orden.orden_id) as ordenes_totales from orden`, (err, resp) => {
                    if (err) { return res.send("Ocurrio un error inesperado") };

                    resumenCards = { ...resumenCards, ordenes: resp[0].ordenes_totales }
                    return res.json(resumenCards);
                })
            })
        })
    })

})



router.get('/orders=pend', (req, res) => {
    req.getConnection((err, connect) => {
        if (err) { return res.send("No se pudo establecer la conexión con el servidor") }

        connect.query(`SELECT
        orden_id AS id,
        orden_total_orden as total
        from orden    
        WHERE orden_estado_order="Pendiente" GROUP BY orden_fechahora ASC`, (err, resp) => {
            if (err) { return res.send("No se puso obtener las ordenes pendientes.") }


            const ordenes = resp;

            // ordenes.map((orden) => {

            //     connect.query(`SELECT
            //     prod_menu_nombre AS producto
            //     FROM detalle_orden
            //     INNER JOIN producto_menu ON producto_menu.prod_menu_id = detalle_orden.det_orden_prod_menu_id
            //     WHERE det_orden_orden_id = ?`, [orden.id], async (err, resp) => {
            //         if (err) { return res.send("No se puso obtener las ordenes pendientes.") };


            //         const order = {
            //             id: orden.id,
            //             products: resp,
            //             total: orden.total
            //         };

            //         setOrders(order);
            //     })
            // })
            // const setOrders = (lista) => {
            //     allOrder = { ...allOrder, lista };
            // };

            return res.json(ordenes);
        })
    })
})


router.get('/get-detailsorders', (req, res) => {
    // const { id, total } = req.body;

    req.getConnection((err, connect) => {
        if(err){throw err};

        connect.query(`SELECT
            prod_menu_nombre as nombre,
            orden_id as id,
            orden_total_orden as total        
        FROM orden
        INNER JOIN detalle_orden ON det_orden_orden_id = orden_id
        INNER JOIN producto_menu ON prod_menu_id = detalle_orden.det_orden_prod_menu_id
        WHERE orden_estado_order = "Pendiente" ORDER BY id`, (err, resp) => {
            if(err){throw err}

            let allOrders = [];
            let newArrayOrder = [];
            let index = 0;
            let anterior = [];
            let productss = {};

            resp.map( row => {
                allOrders = [...allOrders, row]
            })

            allOrders.map(item => {
                index === 0 ? index = item.id : null;
                if(item.id !== index){
                    anterior.map((producto, index) => {
                        productss = {...productss, index};
                    });
                    index = item.id;
                    console.log(productss);
                }else{
                    anterior = [...anterior, {producto : item.nombre, id:item.id}];
                    
                    // newArrayOrder.push({
                    //     id: item.id,
                    //     products: item.nombre,
                    //     total: item.total
                    // });
                    // console.log(anterior)
                }
            })
            return res.send(newArrayOrder);
        })
    })
})


//consulta de cantidad de clientes
router.get('/resumencliente', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
            `
            SELECT COUNT(cliente.cliente_id) as total_clientes FROM cliente;
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
router.get('/ordenes/cantidad', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(
        `
        SELECT
			COUNT(orden.orden_id) as total_orden
        from orden
        `, (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})






module.exports = router;