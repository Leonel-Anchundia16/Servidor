const multer = require('multer');
const path = require('path');

const diskstorage = multer.diskStorage({
  destination : path.join(__dirname, '../private'),
  filename : ( req, file, callBackMulter ) => {
    callBackMulter(null, Date.now()+ "-luchin-" +file.originalname );
  }
});

const fileUpload = multer({
  storage : diskstorage
}).single('image')


module.exports = fileUpload;