const { Router } = require('express');
const router = Router();


router.get('/empleado', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
         SELECT empl_id,concat  (empl_nombre,' - ' ,empl_apellidos) AS 'nombres empleados', empl_tipo_empl_id, empl_email ,empl_fechanac ,empl_telefono
         FROM empleado;
        `, (err, rows) => {
            if (err) return res.send(err)
            res.json(rows)
        })
    })
})


router.get('/empleado/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`
        SELECT 
        empleado.empl_id AS 'id',
        empleado.empl_nombre AS 'nombre',
        empleado.empl_apellidos AS 'apellido',
        empleado.empl_email AS 'correo',
        empleado.empl_telefono AS 'telefono',
        empleado.empl_fechanac AS 'fnacimiento'
        FROM empleado;
        `, (err, rows) => {
            if (err) return res.send(err)
            res.json(rows)
        })
    })
})

// insertar un Empleado 
router.post('/insertar/empleado', (req, res)=>{
    const{name,namel,dat,tel,email,select}=req.body;
    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        INSERT INTO empleado(empl_nombre, empl_apellidos,
        empl_telefono , empl_fechanac, empl_email
        , empl_tipo_empl_id) 
        VALUES(?,?,?,?,?,?);
        `
        , [name,namel,tel,dat,email,select], (err, rows)=>{
            if(err) return res.send(err)
            return res.send('promocion added!')
        })
    })
})



module.exports = router;