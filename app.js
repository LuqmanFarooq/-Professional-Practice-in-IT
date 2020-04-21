// including pacages
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport'); 
// connect to db
mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
    console.log('connected to mongodb');
})


//init app
var app = express();

// view engin setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global errors variable
app.locals.errors = null;

// Get page model
var Page = require('./models/page');

// GET all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
    if (err) {
        console.log(err);
    }
    else
    {
        app.locals.pages = pages;
    }
});

// Get category model
var Category = require('./models/category');

// GET all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    }
    else
    {
        app.locals.categories = categories;
    }
});

// Express File upload middleware
app.use(fileUpload());

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
//parse application json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //   cookie: { secure: true}
}));

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// passport config file require
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// the way the cart is gonna work is it will be a session called cart which is goonna be an array which will hold objects (products)
// the following code make it available everywhere
app.get('*',function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
 });

// set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');   
var cart = require('./routes/cart.js');  
var users = require('./routes/users.js');  
var adminpages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');


// whenever route is called it will take to the pages.js and then to route
app.use('/admin/pages', adminpages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users );
app.use('/', pages);

// start the server
var port = 3000;

app.listen(port, function () {
    console.log('server listening on part' + port);
});