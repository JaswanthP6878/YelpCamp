module.exports.isLoggedin = (req, res, next)  => {
    if(!req.isAuthenticated()){
        req.flash('error', 'you have to login first');
        return res.redirect('/login');
    }
    next();
}