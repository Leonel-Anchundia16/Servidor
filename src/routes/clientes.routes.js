const { Router } = require('express');
const router = Router();

router.get('/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) { return res.send(err)};

        conn.query(`SELECT 
        cliente_id, 
        cliente_cedula,
        CONCAT(cliente_nombre,' ',cliente_apellido) AS nombres,  
        CONCAT('0',cliente_telefono) AS cliente_telefono, 
        cliente_email
        FROM cliente`, (err, rows) => {
            if (err) return res.send(err)

            return res.status(200).json(rows);
        })
    })
})

module.exports = router;