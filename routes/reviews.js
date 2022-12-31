const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema }  = require('../joiSchemas');


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        console.log('error at validating');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}

router.post('/', validateReview,  catchAsync( async (req, res) => {
    // res.send('hit the post route');
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    console.log(review);
    req.flash('success', 'added a new review!');
    res.redirect(`/campgrounds/${camp._id}`);
}))
router.delete('/:reviewid', catchAsync(async (req, res) => {
        const {id, reviewid} = req.params;
        await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewid}});
        await Review.findByIdAndDelete(req.params.reviewid);
        req.flash('success', 'deleted Review successFully');
        res.redirect(`/campgrounds/${id}`);
}))

module.exports = router