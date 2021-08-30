const { Router } = require('express');
const router = Router();


router.get('/listacliente', (req, res) => {
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

module.exports = router;