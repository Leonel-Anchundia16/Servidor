const { Router } = require('express');
const router = Router();
const bscrypt = require('bcrypt');


router.get('/get=typesemployed', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`SELECT tipo_empl_id as id, tipo_empl_nombre as name FROM tipo_empleado`, (err, rows) => {
            if (err) {return res.send(err)};

            return res.json(rows);
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
router.post('/insertar/empleado', async (req, res)=>{
    const { firstName, lastName, emailEmpl, typeEmpl, dateNacm, numberEmpl, password } = req.body;
    const encripPass = await bscrypt.hash(password, 8);
    
    req.getConnection((err, conn)=>{
        if(err){ return res.send(false); };

        conn.query(`INSERT INTO empleado( empl_nombre, empl_apellidos,
        empl_telefono , empl_fechanac, empl_email,
        empl_tipo_empl_id, empl_password) 
        VALUES(?,?,?,?,?,?,?);
        `, [ firstName, lastName, numberEmpl, dateNacm, emailEmpl, typeEmpl, encripPass ], (err, rows)=>{
            if(err){ return res.send(false) };

            return res.send(true);
        })
    })
})


router.delete('/eliminaremp/:id', (req, res)=>{
    const { id } =req.params;

    req.getConnection((err, conn)=>{
        if(err) {return res.send(err)};

        conn.query(`DELETE FROM empleado WHERE empl_id = ?`, [ id ], (err, rows)=>{
            if(err) return res.send(err)
  
            return res.send(true);
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