const { Router, response } = require('express');
const config = require('../config');
const router = Router();
const jsonWt = require('jsonwebtoken');
const bscrypt = require('bcrypt');


router.post('/login', async (req, res)=>{
  const { email, password } = req.body;

  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(`SELECT
          cliente_id as id,
          cliente_nombre as user, 
          cliente_password as password
      FROM cliente WHERE cliente_email = ?`, [email], async (err, response)=>{
          if(response.length === 0 || !(await bscrypt.compare(password, response[0].password))){
              res.json({response: false});
          }else{
            const userForToken = {
                id: response[0].id,
                username: response[0].user
            }
            const token  = jsonWt.sign(userForToken, config.USER_SECRET)

            res.json({response : true, jwt: token});
          }
          
          if(err) return res.send(err)
      })
  })
});

router.post('/signup', async (req, res)=>{
  const { firstName, lastName, email, dateNacm, telefono, password } = req.body;
  const encripPass = await bscrypt.hash(password, 8);
  
  req.getConnection((err, conn) => {
      if(err) return res.send(err)

      conn.query(`SELECT cliente_email FROM cliente WHERE cliente_email = ?`, [email], (err, resp) => {
          if(resp.length === 0){
            conn.query(`INSERT INTO cliente(cliente_nombre, cliente_apellido, cliente_fechanac, cliente_telefono, cliente_email, cliente_password) VALUES (?, ?, ?, ?, ?, ?)`,
            [ firstName, lastName, dateNacm, telefono, email, encripPass ], (err, resp) => {
                if(err){
                    return res.json({ response: false });
                }else{
                    conn.query('SELECT cliente_id as id, cliente_nombre as username FROM cliente WHERE cliente_email = ?', [email], (err, response) => {
                        if(err){
                            return res.send(err)
                        }
                        if(!(response.length === 0)){
                            const { id, username } = response[0];

                            const userForToken = { id, username }

                            const token  = jsonWt.sign(userForToken, config.USER_SECRET)
                            return res.json({ response: true, jwt: token });
                        }
                        return res.json({response: false})
                    })
                };
            })
          }else {
              return res.send(err);
          };
      })

  })
});

router.post('/admin/login', async (req, res)=>{
  const { email, password } = req.body;

  req.getConnection((err, conn)=>{
      if(err) return res.send(err)
      conn.query(`SELECT 
          empl_id as id,
          empl_nombre as user,
          empl_email as email,
          empl_password as password
      FROM empleado WHERE empl_email = ?`, [email], async (err, response)=>{

          if(err){ return res.send(err) }

          if(response.length === 0 || !(await bscrypt.compare( password, response[0].password ))){
              return res.json({response: false});
          }else{
              
            const userForToken = {
                id: response[0].id,
                username: response[0].user
            }
            const token  = jsonWt.sign(userForToken, config.ADMIN_SECRET)

            return res.json({response : true , jwt: token });
          }
          
      })
  })
});


router.post('/verifUser', (req, res) => {
    
    const authorization = req.get("authorization");
    let token = '';

    if(authorization && authorization.toLowerCase().startsWith("bearer")){
        token = authorization.substring(7);
    }

    let decodedToken = {}
    try{
        decodedToken = jsonWt.verify( token, config.USER_SECRET);
    }catch(e){
        response.status(401);
        return res.send("Not authorized");
    }
    
    if(!token || !decodedToken.id){
        return response.status(401).json({error: "No tienes Acceso a este pestaña"});
    }else{
        req.getConnection( (err, conn ) => {
            conn.query('SELECT cliente_id FROM cliente WHERE cliente_id = ?', [decodedToken.id], ( err, resp ) => {
                if(err){
                    console.log("buenas buenas no encontre tu usuario")
                    return res.send(err);
                }
                if(resp.lenght === 0){
                    response.status(401);
                    return res.send(false)
                }else{
                    response.status(200);
                    return res.send(true);
                }
            })
        })
    }
});


router.post('/verifAdmin', (req, res) => {
    const authorization = req.get("authorization");
    let token = '';
    
    if(authorization && authorization.toLowerCase().startsWith("bearer")){
        token = authorization.substring(7);
    }
    
    let decodedToken = {}
    try{
        decodedToken = jsonWt.verify(token, config.ADMIN_SECRET);
    }catch(err){
        response.status(401);
        return res.send("Not authorized");
    }
        
    if(!token || !decodedToken.id){
        response.status(401)
        return res.send({error: "No cuentas con los permisos necesarios para ejecutar esta pestaña"});
    }else{
        req.getConnection( (err, conn ) => {
            conn.query('SELECT empl_id FROM empleado WHERE empl_id = ?', [decodedToken.id], ( err, resp ) => {
                if(err){
                    return res.send(console.error(err));
                }
                if(resp.lenght === 0){
                    response.status(200);
                    return res.send(false)
                }else{
                    response.status(200);
                    return res.send(true);
                }
            })
        })
    }
});


module.exports = router;