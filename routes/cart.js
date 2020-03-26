var express = require('express');
var router = express.Router();

// Get product model from models folder
var Product = require('../models/product');

/*
 * Get add product to cart 
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;
    Product.findOne({ slug: slug }, function (err, pro) {
        if (err)
            console.log(err);

        // checking if session cart is defined if not define it and add the product
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(pro.price).toFixed(2),
                image: '/product_images/' + pro._id + '/' + pro.image
            });
        }
        else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                // checking if item already exists in cart the increment qty
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }// for
            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(pro.price).toFixed(2),
                    image: '/product_images/' + pro._id + '/' + pro.image
                });
            }
        }
        //console.log(req.session.cart);
        req.flash('success', 'Product Added!');
        res.redirect('back');
    });
});

// Get Checkout Page
router.get('/checkout', function (req, res) {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});


// Get update product
router.get('/update/:product', function (req, res) {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;

                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) {
                        cart.splice(i, 1);
                    }
                    break;

                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) {
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('update not working');
                    break;
            }
            break;
        }
    }
    req.flash('success', 'Cart Updated!');
    res.redirect('/cart/checkout');
});

// Get Clear cart
router.get('/clear', function (req, res) {
    delete req.session.cart;
    req.flash('success', 'Cart Cleared!');
    res.redirect('/cart/checkout');
});

// Get Buy cart
router.get('/buy', function (req, res) {
    delete req.session.cart;
    
    res.sendStatus(200);
});

// Exports
module.exports = router;