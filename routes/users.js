const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

//Load User model
require('../models/User');
const User = mongoose.model('users');

//User Login route
router.get('/login', (req, res) => {
  res.render('users/login');
});

//USer Register route
router.get('/register', (req, res) => {
  res.render('users/register');
});

//Login Form post
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Register Form post
router.post('/register', (req, res) => {
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({
      text: "Password do not match"
    });
  }
  if (req.body.password.length < 5) {
    errors.push({
      text: "Password must be atleast 5 characters long"
    });
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (user) {
          req.flash('error_msgs', 'This email is already registered');
          res.redirect('/users/register')
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('messages', 'Registration Successful. Your can now log in to your account');
                  res.redirect('/users/login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                })
            });
          });
        }
      });

  }
});

//Logout users
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('messages', 'Successfully logout');
  res.redirect('/users/login');
});

module.exports = router;
