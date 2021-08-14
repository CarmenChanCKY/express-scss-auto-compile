var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/stylesheets/css/:test',function(req,res,next){
  res.render('index', { title:'correct',title2: req.params.test });
});

module.exports = router;
