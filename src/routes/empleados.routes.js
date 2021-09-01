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
    const{name,namel,dat,tel,email,select,password}=req.body;
    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        INSERT INTO empleado(empl_nombre, empl_apellidos,
        empl_telefono , empl_fechanac, empl_email,
        empl_tipo_empl_id, empl_password) 
        VALUES(?,?,?,?,?,?,?);
        `
        , [name,namel,tel,dat,email,select,password], (err, rows)=>{
            if(err) return res.send(err)
            return res.send('empleado agregado!')
        })
    })
})


router.delete('/eliminaremp/:id', (req, res)=>{
    const{id}=req.body;
    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        DELETE FROM empleado WHERE empl_id = ?
        `
        , [req.params.id]
        , (err, rows)=>{
            if(err) return res.send(err)
  
            res.send('Empleado Eliminado!')
        })
    })
})

  router.put('/actualizar/empleado-admin/:id', (req, res)=>{
    const{name,namel,dat,tel,email,select,id}=req.body;
    req.getConnection((err, conn)=>{
        if(err) return res.send(err)
        conn.query(
        `
        UPDATE empleado SET empl_nombre = ?,
        empl_apellidos = ?, empl_telefono = ?, empl_fechanac = ?,
        empl_email = ?,empl_tipo_empl_id=? WHERE empleado.empl_id = ?;
        `
        , [name,namel,tel,dat,email,select,id], (err, rows)=>{
            if(err) return res.send(err)
  
            res.send('empleado actualizado!')
        })
    })
  })


module.exports = router;