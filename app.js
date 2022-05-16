var express = require('express')
var app = express()
var port = 3000
var bodyParser = require('body-parser')
var router = require('./router/index')
var path = require('path')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override')
var flash = require('connect-flash')
var logger = require('morgan');
var MongoStore = require("connect-mongo")
var session = require('express-session')

const mongoose = require('mongoose')

const expressSession = require('express-session')({
    resave: false,
    saveUninitialized: false
})


app.use(methodOverride('_method'))
app.use(flash());



const db = require('./mongodb/index');
db.mongoose.connect(db.url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
.then(() => {
    //  console.log('db.url', db.url); 
    //  console.log('db.mongoose', db.mongoose); 
    //  console.log('db.tutorial.db', db.tutorial.db); 
     console.log('Database Connection Success.'); 
    }).catch(err => { 
        console.log('Database Connection Failure.', err); 
        process.exit(); });


var User = require('./mongodb/models/user')
var Article = require('./mongodb/models/article')
const { redirect } = require('express/lib/response')
const { resourceLimits } = require('worker_threads')

var isAuthenticated = function(req,res,next){
    console.log(123);
    if(req.isAuthenticated()){
      console.log('it work');
      return next();}
    res.redirect('/signup');
  };


app.use(express.static(path.join(__dirname, 'public')));
  app.use(
    session({
        secret:'hello',
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl : 'mongodb+srv://user1:1q2w3e4r@cluster0.ftq64.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'    
        }),
    })
);

console.log('dkdkdkdk')


app.use(passport.authenticate('session'));
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy({

    usernameField:'id',
    passwordField:'password'
},
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        console.log(username, password)
        if (err) { 
            console.log(err);
            return done(err); }
        if (!user) { 
            console.log('no id')
            res.alert('ther is no ID')
            return done(null, false, {message: 'there is no ID'}); }
        if (user.password != password) { 
            console.log('?????')
            
            return done(null, false,{message: 'there is no ID'}); }
        return done(null, user);
      });
    }
  ));


//use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, cb) {
    console.log(user)
    process.nextTick(function() {
      cb(null, user);
    });
  });
  passport.deserializeUser(function(user, cb) {
    console.log(user)
    process.nextTick(function() {
      return cb(null, user);
    });
  });


app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')





1

app.get('/', function (req, res, next) {
    res.render('login');
})


app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/mypage',
    failureRedirect: '/signup',
    badrequestMessage : 'There is no ID or wrong password',
    failureFlash : true
}));

app.get('/signup', function (req, res) {
    res.render('signUp');
})

app.post('/signup', function (req, res) {
    const user = new User({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        username : req.body.Email,
        password : req.body.password
    })

    user.save((error, userInfo) => {
        if (error) return res.json({ success: false, error })
        return res.redirect('/')
    })
})

//혹시 isAuthentication이 안되면 뒤에 ()를 붙였는지 확인하자
app.get('/mypage',isAuthenticated, function(req,res,next){
    console.log(req.user)
    res.render('mypage',{
        'name' : req.user.name,
        'email' : req.user.username,
        'signupDate' : req.user.signupDate,
        
    })
})

app.get('/userInfoFix',isAuthenticated, function(req,res,next){
    res.render('userInfoFix',{
        'name' : req.user.name,
        'email' : req.user.username,
        'password':req.user.password,
        'ID' : req.user.username
    })
})

app.put('/userFix/:id',isAuthenticated, function(req, res,next){
    var postID = req.params.id
    console.log(req.body, "dkdk")
    
    User.findOneAndUpdate({username :postID},req.body, function(err, user){
        console.log(user)
        if(err) return res.status(500).json({ error: 'database failure' });
        if(!user) return res.status(404).json({ error: 'user not found' });

        if(req.body.name) user.name = req.body.name;
        if(req.body.email) user.username = req.body.email;
        if(req.body.password) user.password = req.body.password;
        console.log(user,'AFTER')

        user.save(function(err){
            if(err) res.status(500).json({error: 'failed to update'});
            req.logout();
            res.redirect('/');
        });

    });

});


app.get('/article', isAuthenticated, function(req,res,next){
    res.render('article')
})

app.post('/article',isAuthenticated, function(req,res,next){
    console.log(req.user,"!!!!!!!!!!!!!!!!!!")
    console.log(req.body)
    const article = new Article({
        _id : new mongoose.Types.ObjectId(),
        title : req.body.title,
        content : req.body.content,
         writer : req.user._id
    })

    article.save((error, articleInfo) => {
        console.log(articleInfo)
        if (error) return res.json({ success: false, error })
        return res.redirect('/mypage')
    })
})


app.get('/articleAll', isAuthenticated, function(req,res,next){
    console.log(req.user._id)
    Article.find({writer: req.user._id}).populate({path:'writer'})
    .then(articleArray =>{
        console.log(articleArray);
        // const posts = Object.entries(articleArray)
        
        res.render('articleAll',{
            posts : articleArray
        })
    })
    .catch(err=>console.log(err))
    
})


app.get('/edit/:id',isAuthenticated, function(req,res,next){
    console.log(req.params)
    Article.findOne({_id: req.params.id}).populate({path:'writer'})
    .then(result =>{
        console.log(result,'find ArTiCle');
        // const posts = Object.entries(articleArray)
        console.log(result.title,'why not?')
        res.render('articleFix',{
            title : result.title,
            content : result.content,
            id : req.params.id
            
        })
    })
    .catch(err=>console.log(err))
})

app.put('/articleFix/:id',isAuthenticated, function(req, res,next){
    let postID = req.params.id;
    console.log(req.body, "check article")
    console.log(req.user)
    Article.findOneAndUpdate({_id : postID},req.body, function(err, article){
        console.log(article)
        if(err) return res.status(500).json({ error: 'database failure' });
        if(!article) return res.status(404).json({ error: 'article not found' });

        if(req.body.title) article.title = req.body.title;
        if(req.body.content) article.content = req.body.content;
       

        article.save(function(err){
            if(err) res.status(500).json({error: 'failed to update'});
            res.redirect('/articleAll');
        });

    });

});

app.delete('/article/:id', isAuthenticated, function(req,res,next){
    if(!req.body){
        return res.status(400).send({
            message: 'Data is Empty'
        })
    }

    const postID = req.params.id
    Article.findOneAndRemove({_id:postID}).populate({path:'writer'})
    .then(result =>{
        if(!result){
            res.status(404).send({
                message: 'Cannot Delete document'
            })
        } else {
            res.redirect('/articleAll')
        }
    })
    .catch(err => {
        console.log(err)
    })
})

app.post('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });

app.listen(port, function () {
    console.log('server start...')
})

