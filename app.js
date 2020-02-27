// including pacages
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
// connect to db
mongoose.connect(config.database,{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open', function(){
    console.log('connected to mongodb');
})


//init app
var app = express();

// view engin setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname,'public')));

// set global errors variable
app.locals.errors = null;

// Express File upload middleware
app.use(fileUpload());

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false}));
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
    errorFormatter: function(param,msg,value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// set routes
var pages = require('./routes/pages.js');
var adminpages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

// whenever route is called it will take to the pages.js and then to route
app.use('/',pages);
app.use('/admin/pages',adminpages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);

// start the server
var port = 3000;

app.listen(port,function() {
    console.log('server listening on part' + port);
});