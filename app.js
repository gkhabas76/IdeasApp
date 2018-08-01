const express = require('express'); //whenever we intsall module we have to require
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express(); // initializes the application

//Loading apps from ideas.js file of routes
const ideas = require('./routes/ideas');

//Loading users routes
const users = require('./routes/users');

//Passport config
require('./config/passport')(passport);

//Mapping global promise to get rid of the warning
mongoose.Promise = global.Promise;
//Connecting to mongoose
mongoose.connect('mongodb://localhost/share-dev', {
    useMongoClient: true //this is no longer needed in mongoose 5.x
  })
  .then(() => console.log('MongoDB Conncected...')) //used promise es6
  .catch(err => console.log(err));


//Adding Handlebar Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//Adding method override Middleware
app.use(methodOverride('_method'))

//Adding Express-session Middleware
app.use(session({
  secret: 'me',
  resave: true,
  saveUninitialized: true
}));

//Adding Passportjs middleware
app.use(passport.initialize());
app.use(passport.session());

//Adding Connect flash Middleware
app.use(flash());

//Adding Global Variables
app.use(function(req, res, next) {
  res.locals.messages = req.flash('messages');
  res.locals.error_msgs = req.flash('error_msgs');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; //it shows whether or not user is logged in. if logged in then log in and sign up are not shown
  next();
});


//Making the route
app.get('/', (req, res) => {
  const title = 'Together, We can Change'; //creating a dynamic data
  res.render('index', {
    title: title //calling the data
  });
});

//Making About route
app.get('/about', (req, res) => {
  const title = 'Welcome to About Us Page';
  res.render('about', {
    title: title
  });
});





//using ideas routes
app.use('/ideas', ideas);

//using users routes
app.use('/users', users);

const port = 3000; // port is defined

app.listen(port, () => { //app displays on certain port
  console.log(`Server started on the port ${port}`);
});
