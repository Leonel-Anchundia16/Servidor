const { Router } = require('express');
const router = Router();

router.get('/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT 
        cliente_id, concat  (cliente_nombre,'  ' ,cliente_apellido) AS 'nombres',  cliente_telefono, cliente_email, cliente_cedula
        FROM cliente`
         , (err, rows) => {
            if (err) return res.send(err)

            res.json(rows)
        })
    })
})

module.exports = router;