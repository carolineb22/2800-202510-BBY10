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
const util = require('util');

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

// Middleware authentication function
function validateSession(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect(308, '/login?noSession=1');
    }
    next();
};

// Middleware logout function
// (TODO REPLACE)
function checkLogout(req, res, next) {
    if(req.query.loggedOut)
    {
        console.log("User logged out (UNIMPLEMENTED)");
    }
    else
    {
        next();
    }
}

// Middleware login validation function
// (TODO REPLACE)
function validateLogin(req, res, next) {
    if(req.query.invalidEmail)
    {
        console.log("Invalid Email (UNIMPLEMENTED)");
    }
    else if(req.query.noAccount)
    {
        console.log("Email has no account (UNIMPLEMENTED)");
    }
    else if(req.query.invalidPassword)
    {
        console.log("Invalid Password (UNIMPLEMENTED)");
    }
    else
    {
        next();
    }
}

// Middleware 

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
app.get('/', checkLogout, (req, res) => {
    res.render('index', {
        title: "Our Tomorrow",
        css: ['styles/index.css', "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"],
        // Do note that only the latter of these two
        // needs to be a crossorigin connection -
        // I didn't bother differentiating the
        // preconnects though so they both do
        // crossorigin - shouldn't be an issue
        preconnect: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    });
});

/* 
 * other page serving functions go here. 
 * Things like post functions for forms can be placed here,
 * while game logic and user registration can be moved to other .js files.
 */

// TODO - remove middleware function,
// catch invalidCred and deal with it properly in `signUp.html`
app.get('/signUp', (req, res) => {
    if (req.query.invalidCred) {
        console.log('UNIMPLEMENTED');
    }
    res.render("signUp", {
        title: "Log In - Our Tomorow",
        css: ["styles/signUp.css", "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"]
    });
});

// TODO - remove middleware function,
// catch noSession, invalidEmail, noAccount, & invalidPassword
// and deal with them properly in `login.html`
app.get('/login', validateLogin, (req, res) => {
    if (req.query.noSession) {
        console.log('UNIMPLEMENTED');
    }
    res.render("login", {
        title: "Log In - Our Tomorow",
        css: ["styles/login.css", "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"]
    });
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

    const result = await userCollection.find({ email: email })
                                       .project({ email: 1, username: 1, password: 1, _id: 1 })
                                       .toArray();

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

app.get('/main', validateSession, async (req, res) => {
    // Get the user profile from the session's username
    let user = await userCollection.find({ username: req.session.username })
                                   .project({ email: 1, username: 1, password: 1, _id: 1 })
                                   .toArray();
    // If the user doesn't have the number to increment,
    // add it
    if(!user.number)
    {
        user.number = 0
    }
    // The "number" is a placeholder incrementer -
    // to be replaced with other relevant stats as
    // we get there
    res.render("mainGame", {
        number: user.number,
        title: "Main Game Page",
        css: ['styles/mainGame.css', "https://fonts.googleapis.com/icon?family=Material+Icons"]
    });
});

// TODO as more game pages are created, add their index.js paths under `/main` to ensure we have proper authorization

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

// TODO REMOVE LATER
app.get('/main/techTree', (req, res) => {
    res.render("techTree", {
        title: "Custom Tech Tree",
        css: "styles/techTree.css"
    })
});

// TODO implement proper html page
app.get('/main/build', (req,res) => {
    res.send(`Unimplemented Page
        <br>
        <form action='/main' method='get'>
            <button>Return to main</button>
        </form>
        <form action='/logout' method='get'>
            <button>Log out</button>
        </form>
        `);
});

// 404 page
app.use(function (req, res) {
    res.status(404).render("404", {
        title: "Page Not Found",
        css: 'styles/404.css'
    });
});

app.listen(port, () => {
    console.log("Node web application listening on port " + port);
});