const express = require('express');
const ejsMate = require('ejs-mate')
const path = require('path');
const mongoose = require('mongoose');
const methodOveride = require('method-override');
const Joi = require('joi');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conenction error"));
db.once("open", () => {
    console.log("Database Connected!");
})

const app = express();
const { nextTick } = require('process');
// config
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOveride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

/// Routes ////////////////////////////////
app.get('/', (req, res) => {
    res.render('home');
})

// routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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