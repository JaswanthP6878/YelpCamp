module.exports.isLoggedin = (req, res, next)  => {
    if(!req.isAuthenticated()){ // this method is added by passport.js
        req.flash('error', 'you have to login first');
        return res.redirect('/login');
    }
    next();
}