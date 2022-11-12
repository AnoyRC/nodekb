const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const passport = require('passport')

//Bring in User Model
let User = require('../models/user');

//Register form
router.get('/register',function(req,res){
  res.render('register');
})


//Register Process
router.post('/register',[
  check('name', 'Name must not be empty').isLength({ min: 1 }),
  check('email', 'Email must not be empty').isLength({ min: 1 }),
  check('email', 'Email is not valid').isEmail(),
  check('username', 'Username must not be empty').isLength({ min: 1 }),
  check('password', 'Password must not be empty').isLength({ min: 1 }),
  check("password2", "invalid password")
        .isLength({ min: 1 })
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
],async (req,res,next) => {

  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    res.render('register',{
      errors:errors
    });
  } else {
    const salt = await bcrypt.genSalt(10);
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, salt)
    });
    newUser.save();
    req.flash('success', 'You are now registered and can log in');
    res.redirect('/users/login');
  }
})

router.get('/login',function(req,res){
  res.render('login');
})

//Login Process
router.post('/login',function(req,res,next){
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req,res,next);
})

//logout
router.get('/logout',function(req,res){
  req.logout(function(err) {
    if (err) { return next(err);
    };
  })
  req.flash('success','You are logged out');
  res.redirect('/users/login');
})


module.exports = router;
