/* All code below is taken from lessons learned in COMP2800.
 * 
 */
require("./utils.js");
require('dotenv').config();

// declare package requirements
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require('joi');

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

// ensure port
const port = process.env.PORT || 3000;

// ensure express
const app = express();

// session maxAge
const expireTime = 24 * 60 * 60 * 1000;

// how many times to salt the passwords
const saltRounds = 10;

// ensure we can read from forms
app.use(express.urlencoded({ extended: false }));

// ensure public directory for styles/content delivery
app.use(express.static(__dirname + "/public"));

app.set('view engine', 'ejs');

// ensure database connection
var { database } = include('databaseConnection');

// ensure database 'users' collection
const userCollection = database.db(mongodb_database).collection('users');

// ensure database collection for sessions
var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
});

// ensure site sessions on
app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}));

// landing page
app.get('/', (req, res) => {
    if(req.query.loggedOut) {
        console.log('UNIMPLEMENTED');
    }
    res.sendFile(__dirname + '/public/html/index.html');
});

/* 
 * other page serving functions go here. 
 * Things like post functions for forms can be placed here,
 * while game logic and user registration can be moved to other .js files.
 */

// TODO catch invalidCred and deal with it properly in `signUp.html`
app.get('/signUp', (req, res) => {
    if (req.query.invalidCred) {
        console.log('UNIMPLEMENTED');
    }

    res.sendFile(__dirname + '/public/html/signUp.html');
});

// TODO catch noSession, invalidEmail, noAccount, & invalidPassword, and deal with them properly in `login.html`
app.get('/login', (req, res) => {
    if (req.query.noSession) {
        console.log('UNIMPLEMENTED');
    }
    if (req.query.invalidEmail) {
        console.log('UNIMPLEMENTED');
    }
    if (req.query.noAccount) {
        console.log('UNIMPLEMENTED');
    }
    if (req.query.invalidPassword) {
        console.log('UNIMPLEMENTED');
    }
    res.sendFile(__dirname + '/public/html/login.html');
});

app.post('/submitUser', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    const schema = Joi.object(
        {
            username: Joi.string().alphanum().max(20).required(),
            password: Joi.string().max(20).required(),
            email: Joi.string().email({ maxDomainSegments: 2, tlds: { allow: ['com', 'net', 'ca'] } }) // TODO loosen restrictions on email requirements
        });

    const validationResult = schema.validate({ username, password, email });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect(308, "/signUp?invalidCred=1");
        return;
    }

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({ username: username, password: hashedPassword, email: email });
    console.log("Inserted user");

    req.session.authenticated = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/main');
});

app.post('/loggingin', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.string().email({ maxDomainSegments: 2, tlds: { allow: ['com', 'net', 'ca'] } })
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect(308, "/login?invalidEmail=1");
        return;
    }

    const result = await userCollection.find({ email: email }).project({ email: 1, username: 1, password: 1, _id: 1 }).toArray();

    console.log(result);
    if (result.length != 1) {
        console.log("user not found");
        res.redirect(308, "/login?noAccount=1");
        return;
    }
    if (await bcrypt.compare(password, result[0].password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.username = result[0].username;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/main');
        return;
    }
    else {
        console.log("incorrect password");
        res.redirect(308, "/login?invalidPassword=1");
        return;
    }
});

app.get('/main', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect(308, '/login?noSession=1');
    }
    res.sendFile(__dirname + '/public/html/main.html');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/?loggedOut=1');
});

app.get('/weatherTest', (req,res) => {
    res.render("weatherTest", {
        title: "Weather Test",
        css: ["styles/index.css"],
        apiKey: process.env.WEATHER_API_KEY
    });
});

// 404 page
app.use(function (req, res) {
    res.status(404).sendFile(__dirname + '/public/html/404.html');
});

app.listen(port, () => {
    console.log("Node web application listening on port " + port);
});