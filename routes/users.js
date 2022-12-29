const express = require('express')
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const catchAsync  = require('../utils/catchAsync');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { user } = req.body;
    const newUser =  new User({email: user.email, username: user.username});
    const registeredUser = await User.register(newUser, user.password);
    console.log(registeredUser);
    req.flash('success', 'welcome to yelpcamp');
    res.redirect('/campgrounds')
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back');
    res.redirect('/campgrounds');

})

module.exports = router;