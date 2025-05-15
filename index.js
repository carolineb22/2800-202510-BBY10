/* The following code is all from lessons learned in 2537 */

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

// Initialize express
const app = express();

// session maxAge
const expireTime = 24 * 60 * 60 * 1000;

// how many times to salt the passwords
const saltRounds = 10;


// ensure we can read from forms
app.use(express.urlencoded({ extended: false }));

// ensure public directory for styles/content delivery
app.use(express.static(__dirname + "/public"));

// set our content delivery to EJS
app.set('view engine', 'ejs');


// ensure database connection
var { database } = include('databaseConnection');

// ensure database 'users' collection
const userCollection = database.db(mongodb_database).collection('users');
const saveCollection = database.db(mongodb_database).collection('test_numbers');


// Middleware authentication function
function validateSession(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?noSession=1');
    }
    else {
        next();
    }
};

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

/* --------------------------------------------------------
 * Page serving functions go here. 
 * Things like post functions for forms can be placed here,
 * while game logic can be moved to client-side .js files.
 */

// landing page
app.get('/', (req, res) => {
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


// TODO - remove middleware function,
// catch invalidCred and deal with it properly in `signUp.html`
app.get('/signUp', (req, res) => {
    var errors = [];

    var invalidCred = req.query.invalidCred;
    var duplicateUsername = req.query.duplicateUsername;
    var duplicateEmail = req.query.duplicateEmail;

    if (invalidCred) {
        errors.push("Invalid account credentials");
    }
    if (duplicateUsername) {
        errors.push("This username is already taken");
    }
    if (duplicateEmail) {
        errors.push("This email is already taken");
    }

    res.render("signUp", {
        title: "Signup - Our Tomorow",
        css: ["styles/signUp.css", "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"],
        errors: errors
    });
});


// TODO - remove middleware function
app.get('/login', (req, res) => {
    var errors = [];

    var noSession = req.query.noSession;
    var invalidEmail = req.query.invalidEmail;
    var noAccount = req.query.noAccount;
    var invalidPassword = req.query.invalidPassword;
    var maliciousUsername = req.query.maliciousUsername;
    var invalidUsername = req.query.invalidUsername;

    if (noSession) {
        errors.push("You are not logged in");
    }
    if (invalidEmail) {
        errors.push("Invalid Email");
    }
    if (noAccount) {
        errors.push("No account found");
    }
    if (invalidPassword) {
        errors.push("Incorrect password");
    }
    if (maliciousUsername) {
        errors.push("Malformed username");
    }
    if (invalidUsername) {
        errors.push("Invalid username");
    }

    res.render("login", {
        title: "Login - Our Tomorow",
        css: ["styles/login.css", "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"],
        errors: errors
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
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } })
        });

    const validationResult = schema.validate({ username, password, email });

    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/signUp?invalidCred=1");
        return;
    }

    // TODO find a way to merge these two queries for efficiency
    var duplicateUsername = await userCollection.find({ username: username }).toArray();
    var duplicateEmail = await userCollection.find({ email: email }).toArray();
    
    if (duplicateUsername.length != 0) {
        res.redirect('/signUp?duplicateUsername=1');
        return;
    }

    if (duplicateEmail.length != 0) {
        res.redirect('/signUp?duplicateEmail=1');
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

    const schema = Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } })
    const validationResult = schema.validate(email);

    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/login?invalidEmail=1");
        return;
    }

    const result = await userCollection.find({ email: email })
        .project({ email: 1, username: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);

    if (result.length != 1) {
        console.log("user not found");
        res.redirect("/login?noAccount=1");
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
        res.redirect("/login?invalidPassword=1");
        return;
    }
});


app.get('/save', validateSession, async (req, res) => {
    var username = req.session.username;

    console.log("Save request received!");

    const schema = Joi.object({ username: Joi.string().alphanum().max(20).required() });

    const validationResult = schema.validate({ username });

    if (validationResult.error != null) {
        res.redirect('/main?saveError=1');
        return;
    }

    // Get user from database
    let user = await userCollection.find({ username: username })
        .project({ email: 1, username: 1, password: 1, _id: 1 })
        .toArray();

    console.log(user);

    // If no user, return
    if (!user) {
        console.log("Could not save.");
        res.status(501)
        return;
    }

    // Else, parse query syntax
    try {
        sectors = JSON.parse(req.query.sectors);
        resources = JSON.parse(req.query.resources);

        console.log(sectors);

        // Upsert (update or insert) user data into database
        await saveCollection.updateOne(
            { username: username }, // Search criteria
            {
                $set: {                          // Info to upsert
                    user_id: user[0]._id,
                    sector: sectors,
                    resources: resources
                }
            },
            { upsert: true });                  // Declare upsert

        console.log("Save successful!");
    } catch (e) {
        // If error, then report it
        console.error(e);
    }

    res.redirect('/main');
});


app.get('/main', validateSession, async (req, res) => {
    var username = req.session.username;

    const schema = Joi.object({ username: Joi.string().alphanum().max(20).required() });

    const validationResult = schema.validate({ username });

    if (validationResult.error != null) {
        res.redirect('/login?maliciousUsername=1');
        return;
    }

    // Get the user profile from the session's username
    let userArray = await userCollection.find({ username: username })
        .project({ _id: 1 })
        .toArray();

    let user = userArray[0];

    console.log([user, user._id]);

    if (!user) {
        console.error(`Access to main with invalid username: ${username}`);
        res.redirect("/login?invalidUsername=1");
        return;
    }

    let statsArray = await saveCollection.find({ user_id: user._id }).toArray();
    let userStats = statsArray[0];

    console.log(userStats);

    res.render("mainGame", {
        title: "Main Game Page",
        css: ['styles/mainGame.css', "https://fonts.googleapis.com/icon?family=Material+Icons"],
        resources: userStats ? JSON.stringify(userStats.resources) : "{}",
        sectors: userStats ? JSON.stringify(userStats.sector) : "[]"
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/weatherTest', (req, res) => {
    res.render("weatherTest", {
        title: "Weather Test",
        css: ["styles/index.css"],
        apiKey: process.env.WEATHER_API_KEY
    });
});

app.get('/main/techTree', validateSession, (req, res) => {
    res.render("techTree", {
        title: "Custom Tech Tree",
        // Since techTree is a subdirectory of main,
        // we have to go one directory up to get
        // the style sheets (and JS)
        css: ["../styles/techTree.css"]
    })
});

// TODO flagged for removal in next sprint
app.get('/main/build', validateSession, (req, res) => {
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


/* Do not add more pages after here, as they'll be caught by the 404 page and wont be displayed. */

// 404 page
app.use(function (req, res) {
    res.status(404).render("404", {
        title: "Page Not Found",
        css: ['styles/404.css']
    });
});

app.listen(port, () => {
    console.log(`Node web application listening on http://localhost:${port}`);
});