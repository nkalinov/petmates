const
    app = require('express')(),
    bodyParser = require('body-parser'),
    passport = require('passport'),

    // routes
    users = require('./routes/users'),
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

app.use(require('cors')());
app.use(require('helmet')());
app.use(require('compression')());
app.use(require('serve-static')(__dirname + '/public'));
// app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
