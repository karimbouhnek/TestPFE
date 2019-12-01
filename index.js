const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const passport = require ('passport');
const session = require('express-session');
const path = require('path');

const app = express();

//chargement des models
require('./Model/User');
const User = mongoose.model('users');

//Configuration Passport
require('./config/passport')(passport);

//Connection a mongoose
mongoose.connect('mongodb://localhost/TestPFE',{
    useNewUrlParser : true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("MongoDB connecté")
})

//dossier statique
app.use(express.static(path.join(__dirname, 'public')));

//session middleware 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }))

app.use(flash());

//Middlewares
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Variables globales
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });


//get /
app.get('/',(req,res)=>{
    res.render('index');
})

//Get Description
app.get('/description',(req,res)=>{
    res.render('description');
})

//Get login
app.get('/login',(req,res)=>{
    res.render('login')
})

//Post login
app.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect : '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
})



//Get sign up
app.get('/signup',(req,res)=>{
    res.render('signup')
})

//Post sign up
app.post('/signup',(req,res)=>{
    let errors = [];
    if (req.body.password != req.body.password2){
        errors.push({text:'Mot de passe non identiques'})
    }
    User.findOne({
        email : req.body.email
    }).then(user=>{
        //console.log(user);
        if (user){
            errors.push({text:'Email déja utilisé'})
            if (errors.length>0){
                res.render('signup',{
                    errors : errors,
                    fname : req.body.fname,
                    lname : req.body.lname,
                    email : req.body.email
                })
            }else{
                const newUser = new User( {
                    fname : req.body.fname,
                    lname : req.body.lname,
                    email : req.body.email,
                    password : req.body.password
                })
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if (err){console.log(err) }
                        newUser.password = hash;
                        newUser.save()
                        .then(user =>{
                            req.flash('success_msg','Compte crée avec succés');
                            res.redirect('/login');
                        }).catch(err =>{
                            console.log(err);
                            return;
                        })
                    })
                });
        
                //console.log(newUser);
            }
        }else{
            if (errors.length>0){
                res.render('signup',{
                    errors : errors,
                    fname : req.body.fname,
                    lname : req.body.lname,
                    email : req.body.email
                })
            }else{
                const newUser = new User( {
                    fname : req.body.fname,
                    lname : req.body.lname,
                    email : req.body.email,
                    password : req.body.password
                })
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if (err){console.log(err) }
                        newUser.password = hash;
                        newUser.save()
                        .then(user =>{
                            req.flash('success_msg','Compte crée avec succés');
                            res.redirect('/login');
                        }).catch(err =>{
                            console.log(err);
                            return;
                        })
                    })
                });
        
                //console.log(newUser);
            }
        }
    })


    
})

//logout
app.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','Déconnecté');
    res.redirect('/login')
})

const port = 5000;

app.listen(port, ()=>{
    console.log(`Server démarré sur le port ${port}`);
});