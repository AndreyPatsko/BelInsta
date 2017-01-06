const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const passport = require('passport');
const session = require("express-session");
const flash = require("connect-flash");
const multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

const router = require('./server/routers');
const setUpPassport = require('./setuppassport');

let app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/belinsta');

setUpPassport();

app.use(express.static(path.join(__dirname , '/client')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(cookieParser('keyboard cat'));



app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.use('/',router);

app.listen(3000,function(){
    console.log('Server started at 3000 port');
});