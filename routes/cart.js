var express = require('express');
var router = express.Router();

// Get product model from models folder
var product = require('../models/product');

/*
 * Get / 
 */
router.get('/', function(req,res){
    Page.findOne({slug: 'home'}, function (err, page) {
        if (err)
        console.log(err);

            res.render('index',{
                title: page.title,
                content: page.content
            });
        
    });
});


// Exports
module.exports = router;