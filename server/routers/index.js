const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cloudinary = require('cloudinary');
const mongoose = require('mongoose');
const multiparty = require('connect-multiparty'); 
multipartyMiddleware = multiparty();


let router = express.Router();

let User = require('../models/users.js');
let Image = require('../models/images.js');

cloudinary.config({
    cloud_name: 'dcf6fjmnd',
    api_key: '683119174833665',
    api_secret: 'PntaGyGkdhsU5C778rddSSXyGM0'
});


router.get('/registration',function(request,response){
    response.redirect('/');
});

router.get('/login',function(request,response){
    response.redirect('/');
});

router.get('/home',function(request,response){
    response.redirect('/');
});

router.post('/login', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

router.post('/registration',function(request,response){
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;

    User.findOne({username:username},function(err,user,next){
        if(err){
            return next(err);
        }
        if(user){
            request.flash('error','User already exists');
            return response.redirect('/registration');
        }
        let newUser = new User({email:email,password:password,username:username});
        newUser.save(function(err){
            if (err) console.log(err);
            
        });
        // response.redirect('/login');
        response.send(true);
    });
});

router.post('/upload', multipartyMiddleware, function (req, res, next) {
   
        if (req.files.image) {
            cloudinary.uploader.upload(req.files.image.path, function (result) {
                if (result.url) {
                    // req.imageLink = result.url;
                    let image = new Image();
                    image.url = result.url;
                    image._owner = req.session._id;
                    image.save((error, response) => {
                        res.status(201).json(result.url)
                    })
                } else {
                    res.json(error);
                }
            });
        } else {
            next();
        }
    });


router.post('/logout',function(request,response){
    request.logout();
    response.send(true);
});


router.get('/',function(request,response){
    response.senFile('./client/index.html');
});
module.exports = router;