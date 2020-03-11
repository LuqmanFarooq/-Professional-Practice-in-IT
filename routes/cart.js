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
    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    });
});

// Exports
module.exports = router;