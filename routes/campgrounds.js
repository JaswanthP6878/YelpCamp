const express = require('express');
const router = express.Router();
const { campgroundSchema}  = require('../joiSchemas');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedin } = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}
router.get('/', async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
})

// create route
router.get('/new',isLoggedin, (req, res) => {
    res.render('campgrounds/new');
})
// creating  a new campground
router.post('/new', isLoggedin , validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success', 'added campground successfully!!');
    res.redirect(`/campgrounds/${camp._id}`);
   
}))

// find route
router.get('/:id', catchAsync(async (req, res) => {
    const { id }  = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds')
    }
    // console.log(camp);
    res.render('campgrounds/show', {camp });
}))

// edit route:
router.get('/:id/edit', isLoggedin ,catchAsync(async (req, res) => {
    const {id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}))

router.put('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, {new : true});
    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`);
}))
// deleting an campsite
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    return res.redirect('/campgrounds');
})

module.exports = router;