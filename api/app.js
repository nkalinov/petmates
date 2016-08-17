const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/users');
const auth = require('./routes/auth');
const mates = require('./routes/mates');
const conversations = require('./routes/conversations');
const pets = require('./routes/pets');
const breeds = require('./routes/breeds');
const nearby = require('./routes/nearby');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const serveStatic = require('serve-static');

var app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(serveStatic(__dirname + '/public'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Use the passport package in our application
app.use(passport.initialize());

app.use('/breeds', breeds);
app.use('/auth', auth);
app.use('/user', users);
app.use('/pets', pets);
app.use('/mates', mates);
app.use('/conversations', conversations);
app.use('/nearby', nearby);

// connect db
require('./config/database')();

// pass passport for configuration
require('./config/passport')(passport);

module.exports = app;
