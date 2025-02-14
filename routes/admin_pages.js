var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
// Get page model from models folder
var Page = require('../models/page');


/*
 Get pages Index
 getting data from databse page collection
*/
router.get('/', isAdmin, function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
* Get add page
*/
router.get('/add-page', isAdmin, function (req, res) {

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
    else {
        // findone is the mongoose method to find unique obect
        Page.findOne({ slug: slug }, function (err, page) {
            // if there is page it means slug is not unique
            if (page) {
                req.flash('danger', 'Page slug already exists', 'choose another.');

                res.render('admin/add_page', {

                    title: title,
                    slug: slug,
                    content: content
                });
            }
            // else if slug is unique sav in a variable
            else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });


            }
        });
    }

});

// Sort pages funtion
function sortPages(ids, callback) {

    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        // as this is not async so to make it async ill wrap it in the closure(count function)
        (function (count) {

            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                        ++count;
                    }
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);
    }
}

/*
 Post reorder pages 
 getting data from databse page collection
*/
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
            if (err) {
                console.log(err);
            }
            else {
                req.app.locals.pages = pages;
            }
        });
    });

});

/*
* Get Edit page
*/
router.get('/edit-page/:id', isAdmin, function (req, res) {

    Page.findById(req.params.id, function (err, page) {

        if (err)
            return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

});


/*
* Post Edit page this is the post request
*/
router.post('/edit-page/:id', function (req, res) {

    req.check('title').not().isEmpty().withMessage('Title is required cannot be empty');
    req.check('content').not().isEmpty().withMessage('Content is required cannot be empty');

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {

        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    }
    else {
        // findone is the mongoose method to find unique obect
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function (err, page) {
            // if there is page it means slug is not unique
            if (page) {
                req.flash('danger', 'Page slug already exists', 'choose another.');

                res.render('admin/edit_page', {

                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            }
            // else if slug is unique sav in a variable
            else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });


                Page.findById(id, function (err, page) {
                    if (err) return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                req.app.locals.pages = pages;
                            }
                        });

                        req.flash('success', 'Page Edited!');
                        res.redirect('/admin/pages');
                    });
                });
            }
        });
    }

});


/*
 Get Delete page
 getting data from databse page collection
*/
router.get('/delete-page/:id', isAdmin, function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);

        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
            if (err) {
                console.log(err);
            }
            else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page Deleted!');
        res.redirect('/admin/pages/');
    });
});
// Exports
module.exports = router;