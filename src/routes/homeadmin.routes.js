const { Router } = require('express');
const router = Router();


router.get('/resumen=all', (req, res) => {
    let resumenCards = [];

    req.getConnection((err, connect) => {
        if (err) { return res.send("Server no response now") }

        connect.query(`SELECT COUNT(cliente_id) as total_clientes FROM cliente`, (err, response) => {
            if (err) { return res.send("Ocurrio un error inesperado") };

            resumenCards = { ...resumenCards, clientes: response[0].total_clientes }
            connect.query(`SELECT COUNT(orden_id) AS ordenes_entrg FROM orden
            WHERE orden_estado_order ="Entregado" OR orden_estado_order = "Servido"`, (err, resp) => {
                if (err) { return res.send("Ocurrio un error inesperado") };

                resumenCards = { ...resumenCards, entregas: resp[0].ordenes_entrg }
                connect.query(`SELECT COUNT(prom_id) AS cantProm FROM promocion
                WHERE prom_fecha_inicio < NOW() AND prom_fecha_fin > NOW()`, (err, resp) => {
                    if (err) { return res.send("Ocurrio un error inesperado") };

                    resumenCards = { ...resumenCards, ordenes: resp[0].cantProm }
                    return res.json(resumenCards);
                })
            })
        })
    })

})


//comentarios de usuarios
router.get('/coments-user_sends', (req, res) => {
    req.getConnection((err, connect) => {
        if(err){return res.status(500).send(err)};

        connect.query(`SELECT
            CONCAT( com_user_fname, ' ', com_user_lname) AS user,
            com_user_email AS email,
            com_asunto AS asunto
        FROM comentario_user
        ORDER BY com_id DESC`, (err, resp) => {
            if(err){return res.status(500).send(err)};

            return res.status(200).json(resp);
        })
    })
})


//ordenes pendientes del dia
router.get('/orders=pend', (req, res) => {
    req.getConnection((err, connect) => {
        if (err) { return res.status(500).send("No se pudo establecer la conexión con el servidor") }

        connect.query(`SELECT
            orden_id as id,
            orden_estado_order as estado,
            CONCAT(cliente_apellido, ' ', cliente_nombre) as cliente,
            CONCAT('0' ,cliente_telefono) as telefono,
            orden_direccion_ubic as destino
        FROM orden
        INNER JOIN cliente ON cliente_id = orden_cliente_id
        WHERE YEAR(orden_fechahora) = YEAR(CURRENT_DATE()) 
            AND MONTH(orden_fechahora) = MONTH(CURRENT_DATE())
            AND DAY(orden_fechahora) = DAY(CURRENT_DATE())
            AND orden_estado_order = "Pendiente"
        ORDER BY orden.orden_fechahora DESC
        LIMIT 15`, (err, resp) => {
            if (err) { return res.status(500).send("No se puso obtener las ordenes pendientes") }

            return res.status(200).json(resp);
        })
    })
})


module.exports = router;