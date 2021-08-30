const express = require('express')
const mysql = require('mysql')
const config = require('./config')
const conectionDB = require('./DBconect');
const myconn = require('express-myconnection')
const cors = require("cors");

const app = express()

const routes = require('./routes');
const authRoute = require('./routes/auth.routes');
const menuProductosRoute = require('./routes/menuprod.routes');
// const clientesRoute = require('./routes/clientes.routes');
// const empleadosRoute = require('./routes/empleados.routes');
const ordenesRoute = require('./routes/ordenes.routes');
const promocionesRoute = require('./routes/promociones.routes');
// const ventasRoute = require('./routes/ventas.routes');


// middlewares -------------------------------------
app.use(myconn(mysql, conectionDB, 'single'))
app.use(express.json());
app.use(cors());


// routes -------------------------------------------
app.use('/api/', routes);
app.use('/api/auth', authRoute);
app.use('/api/menu', menuProductosRoute);
// app.use('/api/clientes', clientesRoute);
// app.use('/api/empleados', empleadosRoute);
app.use('/api/ordenes', ordenesRoute);
app.use('/api/promociones', promocionesRoute);
// app.use('/api/ventas', ventasRoute);



// server running -----------------------------------
app.listen(config.PORT, config.HOST, () => {
  console.log('SERVER RUNNING ON ', `http://${config.HOST}:${config.PORT}/api`)
})