const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

//Load IDea model
require('../models/Idea');
const Idea = mongoose.model('ideas');
//Creating idea page route and assigning it the name of index. it will be in ideas folder
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({
      user: req.user.id
    })
    .sort({
      date: 'desc'
    })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });

    })
});

//Creating add routes and Adding Idea form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

//Routing to ideas/edit page. Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {

      if (idea.user != req.user.id) {
        req.flash('error_msgs', 'Not Authorized');
        res.redirect('/ideas');
      } else {
        res.render('ideas/edit', {
          idea: idea
        });
      }

    });

});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add a title'
    });
  }
  if (!req.body.details) {
    errors.push({
      text: 'Please add some details'
    });
  }

  if (errors.length > 0) {
    res.render('/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('messages', 'Successfully Added');
        res.redirect('/ideas') // here /ideas is the page
      })
  }
});

//Making put request. Edit form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(idea => {
          req.flash('messages', 'Successfully Edited');
          res.redirect('/ideas');
        })
    });
});

//Delete IDea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({
      _id: req.params.id
    })
    .then(() => {
      req.flash('messages', 'Successfully Removed');
      res.redirect('/ideas');
    });
});

module.exports = router;
