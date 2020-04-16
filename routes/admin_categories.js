var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get category model from models folder
var Category = require('../models/category');

/*
 Get category Index
 getting data from databse categories collection
*/
router.get('/', isAdmin, function (req, res) {

    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
* Get add category
*/
router.get('/add-category', isAdmin, function (req, res) {

    var title = "";

    res.render('admin/add_category', {
        title: title
    });

});

/*
* Post add category this is the post request
*/
router.post('/add-category', function (req, res) {

    req.check('title').not().isEmpty().withMessage('Title is required cannot be empty');

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {

        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    }
    else {
        // findone is the mongoose method to find unique obect
        Category.findOne({ slug: slug }, function (err, category) {
            // if there is page it means slug is not unique
            if (category) {
                req.flash('danger', 'Category title already exists', 'choose another.');

                res.render('admin/add_category', {
                    title: title,
                });
            }
            // else if slug is unique sav in a variable
            else {
                var category = new Category({
                    title: title,
                    slug: slug,
                });

                category.save(function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    // GET all categories to pass to header.ejs
                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.app.locals.categories = categories;
                        }
                    });
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });


            }
        });
    }

});



/*
* Get Edit category
*/
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {

        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});


/*
* Post Edit category this is the post request
*/
router.post('/edit-category/:id', function (req, res) {

    req.check('title').not().isEmpty().withMessage('Title is required cannot be empty');

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {

        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    }
    else {
        // findone is the mongoose method to find unique obect
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            // if there is page it means slug is not unique
            if (category) {
                req.flash('danger', 'Category title already exists', 'choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            }
            // else if slug is unique sav in a variable
            else {

                Category.findById(id, function (err, category) {
                    if (err) return console.log(err);

                    category.title = title;
                    category.slug = slug;


                    category.save(function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        // GET all categories to pass to header.ejs
                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                req.app.locals.categories = categories;
                            }
                        });
                        req.flash('success', 'Category Edited!');
                        res.redirect('/admin/categories');
                    });
                });
            }
        });
    }

});


/*
 Get Delete category
 getting data from databse page collection
*/
router.get('/delete-category/:id', isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);
        // GET all categories to pass to header.ejs
        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            }
            else {
                req.app.locals.categories = categories;
            }
        });
        req.flash('success', 'Category Deleted!');
        res.redirect('/admin/categories/');
    });
});
// Exports
module.exports = router;