module.exports = {
  ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error_msgs', 'You must logged in first');
    res.redirect('/users/login');
  }
}
