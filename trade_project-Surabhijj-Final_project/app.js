//require modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const tradeRoutes = require('./routes/tradeRoutes')
const methodOverride = require('method-override')
const siteRoutes = require('./routes/siteRoutes')
const userRoutes = require('./routes/userRoutes')
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");


//create app
const app = express();



//comfigure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect('mongodb://localhost:27017/SJ_jewelry',{useUnifiedTopology: true ,useNewUrlParser: true ,useCreateIndex: true})

.then(()=>{
    app.listen(port,host,()=>{
        console.log('server is running on port',port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(
    session({
      secret: "hfgfgjhgffsagsjasnkhduqhsqgshqshqsys71wyug",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 },
      store: new MongoStore({ mongoUrl: "mongodb://localhost:27017/SJ_jewelry" }),
    })
  );
  
  app.use(flash());
  
  app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash("success");
    res.locals.errorMessages = req.flash("error");
    next();
  });


// set up routes
app.get('/', (req,res)=>{
    res.render('index');
});

app.use('/trades', tradeRoutes);
app.use('/', siteRoutes);

app.use('/users', userRoutes);

app.use((req,res,next)=>{
    let err  = new Error('The server cannot locate '+ req.url);
    err.status =404;
    next(err);
});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internet Server Error");

    }
    res.status(err.status);
    res.render('error',{error:err});
});


// app.get('/about',(req,res)=>{
//     res.render('about');
// });

// app.get('/contact', (req, res)=>{
//     res.render('contact');
// });

