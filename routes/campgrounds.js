const express = require('express');
const router = express.Router();
const { campgroundSchema}  = require('../joiSchemas');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedin } = require('../middleware');


// image upload config
const { storage } = require('../cloudinary');
const multer  = require('multer')
const upload = multer({ storage })

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
router.get('/', async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
})

// create route
router.get('/new',isLoggedin, (req, res) => {
    res.render('campgrounds/new');
})
//creating  a new campground
router.post('/new', isLoggedin, upload.array('image') ,validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    camp.images = req.files.map(f => ({url : f.path, filename: f.filename}));
    camp.author = req.user._id; // adding the author to campground
    await camp.save();
    console.log(camp);
    req.flash('success', 'added campground successfully!!');
    res.redirect(`/campgrounds/${camp._id}`);
   
}))

// // testing cloudinary
// router.post('/new', upload.single('image'), (req, res) => {
//     console.log(req.body, req.file);
//     res.send('It worked!!!');
// })

// find route
router.get('/:id', catchAsync(async (req, res) => {
    const { id }  = req.params;
    const camp = await Campground.findById(id).populate({ // nested populate
        path : 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(camp);
    if(!camp){
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds')
    }
    // console.log(camp);
    res.render('campgrounds/show', {camp });
}))

// edit route:
router.get('/:id/edit', isLoggedin, isAuthor ,catchAsync(async (req, res) => {
    const {id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}))

router.put('/:id', isLoggedin, isAuthor, upload.array('image') ,catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, {new : true});
    const images = req.files.map(f => ({url : f.path, filename: f.filename}));
    campground.images.push(...images);
    await campground.save();
    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`);
}))
// deleting an campsite
router.delete('/:id', isLoggedin, isAuthor , async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    return res.redirect('/campgrounds');
})

module.exports = router;