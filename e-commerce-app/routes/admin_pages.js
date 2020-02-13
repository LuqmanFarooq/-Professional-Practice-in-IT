var express = require('express');
var router = express.Router();

// Get page model from models folder
var Page = require('../models/page');


/*
 Get pages Index
 getting data from databse page collection
*/
router.get('/', function (req, res) {
    Page.find({}).sort({sorting:1}).exec(function(err,pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
* Get add page
*/
router.get('/add-page', function (req, res) {

    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });

});

/*
* Post add page this is the post request
*/
router.post('/add-page', function (req, res) {

    req.check('title').not().isEmpty().withMessage('Title is required cannot be empty');
    req.check('content').not().isEmpty().withMessage('Content is required cannot be empty');
    
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors) {
       
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    }
    else
    {
        // findone is the mongoose method to find unique obect
        Page.findOne({slug: slug}, function(err, page){
            // if there is page it means slug is not unique
             if(page) {
                req.flash('danger','Page slug already exists', 'choose another.');

                res.render('admin/add_page', {
                    
                    title: title,
                    slug: slug,
                    content: content
                });
            }
            // else if slug is unique sav in a variable
            else
            {
               var page = new Page({
                   title: title,
                   slug: slug,
                   content: content,
                   sorting: 100
               });
            
               page.save(function(err) {
                    if(err)
                    {
                        return console.log(err);
                    }

                    req.flash('Success','Page added!');
                    res.redirect('/admin/pages');
                });
             
             
            }
        });
    }

});

/*
 Post reorder pages 
 getting data from databse page collection
*/
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];

    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        // as this is not async so to make it async ill wrap it in the closure(count function)
        (function(count) {

        Page.findById(id , function(err,page) {
            page.sorting = count;
            page.save(function(err) {
                if (err)
                {
                    return console.log(err);
                }
            });
        });
    })(count);
    }
});

// Exports
module.exports = router;