const express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    cors = require('cors'),
    helmet = require('helmet'),
    compression = require('compression'),
    serveStatic = require('serve-static'),
    app = express();

const users = require('./routes/users'),
    auth = require('./routes/auth'),
    mates = require('./routes/mates'),
    conversations = require('./routes/conversations'),
    pets = require('./routes/pets'),
    breeds = require('./routes/breeds'),
    nearby = require('./routes/nearby'),
    events = require('./routes/events'),
    places = require('./routes/places'),
    upload = require('./routes/upload'),
    reports = require('./routes/reports');

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(serveStatic(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());

app.use('/breeds', breeds);
app.use('/auth', auth);
app.use('/user', users);
app.use('/pets', pets);
app.use('/mates', mates);
app.use('/conversations', conversations);
app.use('/nearby', nearby);
app.use('/events', events);
app.use('/places', places);
app.use('/upload', upload);
app.use('/reports', reports);

require('./config/database');
require('./config/passport')(passport);

module.exports = app;
