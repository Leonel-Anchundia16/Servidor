const { Router } = require('express');
const router = Router();
const bscrypt = require('bcrypt');
const config = require('../config');
const jsonWt = require('jsonwebtoken');


//verificar empleado
router.post('/verf/NrGDIp2PH7FflhBY', (req, res) => {
    const { password } = req.body;
    const authorization = req.get("authorization");
    let token = '';
    
    if(authorization && authorization.toLowerCase().startsWith("bearer")){
        token = authorization.substring(7);
    }
    
    let decodedToken = {}
    try{
        decodedToken = jsonWt.verify(token, config.ADMIN_SECRET);
    }catch(err){
        return res.status(401).send("Not authorized");
    }
        
    if(!token || !decodedToken.id){
        return res.status(401).send({error: "No cuentas con los permisos necesarios para ejecutar esta acción"});
    }else{
        req.getConnection( (err, conn ) => {
            if(err){ return res.status(500).send(err); }

            conn.query('SELECT empl_password FROM empleado WHERE empl_id = ?', [decodedToken.id], async ( err, resp ) => {
                if(err){ return res.status(401).send(err); }

                if(resp.lenght === 0 || !(await bscrypt.compare( password, resp[0].empl_password ))){
                    return res.status(200).send(false);
                }                
                return res.status(200).send(true);
            })
        })
    }

})


//obtener los tipos de empleados
router.get('/get=typesemployed', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err)

        conn.query(`SELECT tipo_empl_id as id, tipo_empl_nombre as name FROM tipo_empleado`, (err, rows) => {
            if (err) { return res.send(err) };

            return res.json(rows);
        })
    })
})


//obtener lista de empleados
router.get('/empleado/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {return res.status(500).send(err)}

        conn.query(`SELECT 
        empl_id AS 'id',
        CONCAT(empl_nombre, ' ', empl_apellidos) AS 'nombres',
        empl_email AS 'correo',
        empl_telefono AS 'telefono',
        empl_fechanac AS 'dateNacm'
        FROM empleado
        ORDER BY id DESC`, (err, rows) => {
            if (err) {return res.status(500).send(err)};

            return res.status(200).json(rows);
        })
    })
})


// insertar un Empleado 
router.post('/insertar/empleado', async (req, res) => {
    const { firstName, lastName, emailEmpl, typeEmpl, dateNacm, numberEmpl, password } = req.body;
    const encripPass = await bscrypt.hash(password, 8);

    req.getConnection((err, conn) => {
        if (err) { return res.send(false); };

        conn.query(`INSERT INTO empleado( empl_nombre, empl_apellidos,
        empl_telefono , empl_fechanac, empl_email,
        empl_tipo_empl_id, empl_password) 
        VALUES(?,?,?,?,?,?,?);
        `, [firstName, lastName, numberEmpl, dateNacm, emailEmpl, typeEmpl, encripPass], (err, rows) => {
            if (err) { return res.send(false) };

            return res.send(true);
        })
    })
})


//eliminar empleado
router.delete('/eliminaremp/:id', (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        if (err) { return res.send(err) };

        conn.query(`DELETE FROM empleado WHERE empl_id = ?`, [id], (err, rows) => {
            if (err) return res.send(err)

            return res.send(true);
        })
    })
})


// ===================================
// ACTUALIZAR EMPLEADO
// ===================================

router.get('/empl_inf_to_update/:id', (req, res) => {
    const { id } = req.params;

    req.getConnection((err, connect) => {
        if(err){return res.status(500).send(err)};
        
        connect.query(`SELECT
            empl_tipo_empl_id AS typeEmpl,
            empl_nombre AS fname,
            empl_apellidos AS lname,
            empl_telefono AS tel,
            empl_fechanac AS dateN,
            empl_email AS email
        FROM empleado WHERE empl_id = ?`, [id], (err, resp) => {
            if(err){return res.status(500).send(err)};

            

            return res.status(200).json(resp[0]);
        })
    })
})


router.put('/update/userWPttAdm/:idEmpl', (req, res) => {
    const { idEmpl } = req.params;
    const { typeEmpl, firstName, lastName, numberEmpl, dateNacm, emailEmpl, newpassword } = req.body;

    req.getConnection((err, conn) => {
        if (err){return res.status(500).send(err)};

        conn.query(`UPDATE empleado SET 
        empl_tipo_empl_id=?,
        empl_nombre = ?,
        empl_apellidos = ?,
        empl_telefono = ?, 
        empl_fechanac = ?,
        empl_email = ? WHERE empleado.empl_id = ?`
        , [ typeEmpl, firstName, lastName, numberEmpl, dateNacm, emailEmpl, idEmpl ], async (err, rows) => {
            if (err) { console.log(err); return  res.status(500).send(false);};

            if(newpassword === ""){
                return  res.status(200).send(true);
            }else{
                const encryPass = await bscrypt.hash(newpassword, 8);
                
                conn.query(`UPDATE empleado SET empl_password = ? WHERE empl_id = ?`, [ encryPass, idEmpl ], (err, resp) =>{
                    if (err) { console.log(err); return res.status(500).send(false);};
        
                    return res.status(200).send(true);
                })
            }
        })
    })
})


module.exports = router;