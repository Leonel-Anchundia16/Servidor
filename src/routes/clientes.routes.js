const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.send(`
  REST API - La Parrilla de Luchín <br/>
  <br/>
  <strong>CONTRIBUITORS:</strong><br/>
  - Andrés Moncayo Zambrano<br/>
  - Leonel Anchundia Lucas<br/>
  - Mendoza Pilligua Jonathan<br/>
  - Espinoza López Eddy<br/>
  - Delgado Alonso Pablo<br/>
  <br/>
  Fecha de Creación: <strong>31 de Agosto del 2021</strong>
  `);
})

module.exports = router;
