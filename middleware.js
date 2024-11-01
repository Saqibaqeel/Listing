const isAuthenticate = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl
        req.flash('error', 'please login');
        return res.redirect('/login');  // Ensure return to avoid multiple responses
    } else {
        next();  // Only calls next if no redirect
    }
};

const saveUrl=(req,res,next)=>{
   if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;  // Clear it after use to prevent persistent redirects
   }
   next()

}

module.exports = {isAuthenticate,saveUrl};
