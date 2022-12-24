const express = require('express');
const ejsMate = require('ejs-mate')
const path = require('path');
const mongoose = require('mongoose');
const methodOveride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema }  = require('./joiSchemas');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conenction error"));
db.once("open", () => {
    console.log("Database Connected!");
})

const app = express();
const Campground = require('./models/campground');
const Review = require('./models/review');
const { nextTick } = require('process');


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOveride('_method'));

const validateCampground = (req, res, next) => {
    const camp = new Campground(req.body.campground);
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}

/// Routes ////////////////////////////////
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
})

// create route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})


// creating  a new campground
app.post('/campgrounds/new', validateCampground, catchAsync(async (req, res, next) => {
    const data = await camp.save();
    console.log(data);
    res.send('data added succesfully!!');
   
}))

// find route
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id }  = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    // console.log(camp);
    res.render('campgrounds/show', {camp });
}))

// edit route:
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, {new : true});
    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`);
}))
// deleting an campsite
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    return res.redirect('/campgrounds');
})

// posting reviews;
app.post('/campgrounds/:id/reviews', validateReview,  catchAsync( async (req, res) => {
    // res.send('hit the post route');
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))
app.delete('/campgrounds/:id/reviews/:reviewid', catchAsync(async (req, res) => {
        const {id, reviewid} = req.params;
        await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewid}});
        await Review.findByIdAndDelete(req.params.reviewid);
        res.redirect(`/campgrounds/${id}`);
}))
// throwing 404 errors; for accessing undefined routes.
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