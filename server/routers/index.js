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
    if(request.isAuthenticated){
    response.redirect('/#/home');
    }
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
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
        let newUser = new User({email:email,password:password,username:username,private:true});
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
                    image._owner = req.user._id;
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

    
router.post('/getCurrentUserImages',function(request,response){
    var currentImagesArray = [];
    Image.find({"_owner":request.user.id},function(err,data){
        if (err) throw err;
        else{
            data.forEach(function(im){
                currentImagesArray.push(im.url)
            })
            response.json(currentImagesArray)
        }
    })  
})

router.post('/getCurrentUserProfile',function(request,response){
    User.find({"_id": request.user.id},function(err,data){
        if (err) throw err;
        else{
            response.send(data[0].private);
        }
    })
})

router.post('/publicUsers',function(request,response){
    var usersArray = [];
    User.find({"private":false},function(err,data){
        if (err) throw err;
        else {
           data.forEach(function(element) {
               usersArray.push({id:element._id,username:element.username})
           }); 
           response.json(usersArray)   
        }
    })
})

router.post('/loadImages',function(request,response){
   
    var imagesArray = [];
    Image.find({"_owner":request.body.id}, function(err,data){
        if (err) throw err;
        else{
            data.forEach(function(im){
                imagesArray.push(im.url)
            })
            response.json(imagesArray)
        }
    })
})


// usersArray.forEach(function(i){
//               i.images=[];
//                Image.find({"_owner":i.id},function(err,images){
//                 //     console.log(i)
//                 //    console.log(images)
//                 // i.images.push(images.url)
//                   images.forEach(function(j){
                       
//                       i.images.push(j.url)
//                    })
//                    responseArray.push(i)
//                    console.log(responseArray)
                   
//                })
            
//            })

router.post('/updateUser',function(request,response){
    // console.log(request.body)
    User.findByIdAndUpdate(request.user._id,{ $set: { private: request.body.profile }}, { new: true },function(err,data){
        if (err) return handleError(err);
        
    })
    response.redirect('/#/home');
})  

router.post('/logout',function(request,response){
    request.logout();
    response.send(true);
});


router.get('/',function(request,response){
    response.senFile('./client/index.html');
});
module.exports = router;