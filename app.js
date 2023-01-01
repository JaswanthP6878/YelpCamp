if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const ejsMate = require('ejs-mate')
const path = require('path');
const mongoose = require('mongoose');
const methodOveride = require('method-override');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const userroutes = require('./routes/users');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;



mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conenction error"));
db.once("open", () => {
    console.log("Database Connected!");
})

const app = express();
const { nextTick } = require('process');


//models
const User = require('./models/user');

// config
const sessionConfig = {
    secret : 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly: true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOveride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(sessionConfig));
app.use(flash());

// setting up passwords(should be done after app session is done)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/// passport settings commpleted.



// these res.locals are available to all the ejs templates
app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/// Routes ////////////////////////////////

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email : 'jp12@gmail.com', username: 'jaswanth1218'});
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);

// })
// routes
app.use('/', userroutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404));
})

// for catching errors..
app.use((err, req, res, next) => {
    const {statusCode  = 500, message = 'something went wrong'} = err;
    res.status(statusCode).render('errors', { err});
})

app.listen(3000,  () => {
    console.log('listening on port 3000!');
})