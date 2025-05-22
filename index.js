/* 
 * The following code is all from lessons learned in 2537.
 * Any additional code such as MongoDB database CRUD are taken
 * from their respective documentation websites.
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

app.use(express.json());  


// ensure database connection
var { database } = include('databaseConnection');

// ensure database 'users' collection
const userCollection = database.db(mongodb_database).collection('users');
const saveCollection = database.db(mongodb_database).collection('test_numbers');
const treeCollection = database.db(mongodb_database).collection('techtrees');
const modsCollection = database.db(mongodb_database).collection('modifiers');


// Middleware authentication function
function validateSession(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?noSession=1');
    }
    else {
        next();
    }
};

// Middleware username validation
async function validateUsername(req, res, next) {
    var username = req.session.username;

    const schema = Joi.object({ username: Joi.string().alphanum().max(20).required() });

    const validationResult = schema.validate({ username });

    if (validationResult.error != null) {
        res.redirect('/login?maliciousUsername=1');
        return;
    }
    else
    {
        next();
    }
}

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


app.get('/signUp', (req, res) => {
    var errors = [];

	// Take in any errors passed from /submitUser
    var invalidCred = req.query.invalidCred;
    var duplicateUsername = req.query.duplicateUsername;
    var duplicateEmail = req.query.duplicateEmail;

	// If any errors, add its message to the ejs page
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


app.get('/login', (req, res) => {
    var errors = [];

	// Take in any errors from /loggingin
    var noSession = req.query.noSession;
    var invalidEmail = req.query.invalidEmail;
    var noAccount = req.query.noAccount;
    var invalidPassword = req.query.invalidPassword;
    var maliciousUsername = req.query.maliciousUsername;
    var invalidUsername = req.query.invalidUsername;

	// If any errors, add its message to the ejs page
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

	// Group vaidation for the above values
    const schema = Joi.object(
        {
            username: Joi.string().alphanum().max(20).required(),
            password: Joi.string().max(20).required(),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } })
        });

    const validationResult = schema.validate({ username, password, email });

	// If there is any error in the validation above, redirect back to /signUp.
    if (validationResult.error != null) {
        console.log(validationResult.error);
        
		res.redirect("/signUp?invalidCred=1");
        return;
    }

	// Next, check if there are any duplicate entries for the credentials we care about.
	// As a note, it's unsafe to check the passwords for duplicates because that give information
	// to attackers that a given password is in use. If paired with the knowledge of used emails, you create an attack vector.
    var duplicateUsername = await userCollection.find({ username: username }).toArray();
    var duplicateEmail = await userCollection.find({ email: email }).toArray();
    
	// Redirect if username or email are duplicates.
    if (duplicateUsername.length != 0) {
        res.redirect('/signUp?duplicateUsername=1');
        return;
    }

    if (duplicateEmail.length != 0) {
        res.redirect('/signUp?duplicateEmail=1');
        return;
    }

	// Encrypt the password, insert the account into the database, and create the cookie.
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({ username: username, password: hashedPassword, email: email });

    console.log("Inserted user");

    req.session.authenticated = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/main?newUser=1');
});


app.post('/loggingin', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

	// Validation for the email.
    const schema = Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } })
    const validationResult = schema.validate(email);

	// If error, redirect and inform the user.
    if (validationResult.error != null) {
        console.log(validationResult.error);

        res.redirect("/login?invalidEmail=1");
        return;
    }

	// Find the given account.
    const result = await userCollection.find({ email: email })
        .project({ email: 1, username: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);


	// Redirect if user not found
    if (result.length != 1) {
        console.log("user not found");

        res.redirect("/login?noAccount=1");
        return;
    }

	// If correct password create cookie and redirect to /main
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


app.post('/save', validateSession, async (req, res) => {
    try {
        // Check if body exists
        if (!req.body) {
            return res.status(400).send("No data received");
        }

        const { sectors, resources } = req.body;
        
        // Validate required fields
        if (!sectors || !resources) {
            return res.status(400).send("Missing sectors or resources data");
        }

        // Rest of your existing code...
        const username = req.session.username;
        
		// Username validation
        const schema = Joi.object({ username: Joi.string().alphanum().max(20).required() });
        const validationResult = schema.validate({ username });

        if (validationResult.error) {
            return res.status(400).send("Invalid username");
        }

        // Get user
        let user = await userCollection.find({ username: username })
            .project({ _id: 1 })
            .toArray();

        if (!user.length) {
            return res.status(401).send("User not found");
        }

        await saveCollection.updateOne(
            { username: username },
            {
                $set: {
                    user_id: user[0]._id,
                    sector: sectors,
                    resources: resources
                }
            },
            { upsert: true }
        );

        return res.sendStatus(200);
        
    } catch (e) {
        console.error(e);
        return res.status(500).send("Save error");
    }
});


app.post('/saveTree', validateSession, async (req, res) => {
    try {
        // Check if body exists
        if (!req.body) {
            return res.status(400).send("No data received");
        }

        const { unlocks, modifiers, points } = req.body;
        
        // Validate required fields
        if (!unlocks || !modifiers) {
            return res.status(400).send("Missing unlocks or modifiers data");
        }

        // Rest of your existing code...
        const username = req.session.username;
        
		// Username validation
        const schema = Joi.object({ username: Joi.string().alphanum().max(20).required() });
        const validationResult = schema.validate({ username });

        if (validationResult.error) {
            return res.status(400).send("Invalid username");
        }

        // Get user
        let user = await userCollection.find({ username: username })
            .project({ _id: 1 })
            .toArray();

        if (!user.length) {
            return res.status(401).send("User not found");
        }

        await saveCollection.updateOne(
            { username: username },
            {
                $set: {
                    user_id: user[0]._id,
                    "resources.ResearchPoints": points
                }
            },
            { upsert: true }
        );

        await treeCollection.updateOne(
            { username: username },
            {
                $set: {
                    user_id: user[0]._id,
                    unlocks: unlocks
                }
            },
            { upsert: true }
        );

        await modsCollection.updateOne(
            { username: username },
            {
                $set: {
                    user_id: user[0]._id,
                    modifiers: modifiers
                }
            },
            { upsert: true }
        );

        return res.sendStatus(200);
        
    } catch (e) {
        console.error(e);
        return res.status(500).send("Save error");
    }
});


app.get('/main', validateSession, validateUsername, async (req, res) => {
    let username = req.session.username;

	// Query flag for tutorial popup
    let newUser = req.query.newUser || null;

    // Get the user profile from the session's username
    let userArray = await userCollection.find({ username: username }).toArray();

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

    let modsArray = await modsCollection.find({ user_id: user._id }).toArray();
    let userMods = modsArray[0];
    console.log(userMods);

    res.render("mainGame", {
        title: "Main - Our Tomorrow",
        css: ['../styles/mainGame.css', "https://fonts.googleapis.com/icon?family=Material+Icons"],
		newUser: newUser,
        resources: userStats ? JSON.stringify(userStats.resources) : "{}",
        sectors: userStats ? JSON.stringify(userStats.sector) : "[]",
        modifiers: userMods ? JSON.stringify(userMods.modifiers) : "{}",
        apiKey: process.env.WEATHER_API_KEY
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

app.get('/main/techTree', validateSession, validateUsername, async (req, res) => {
    let username = req.session.username;

    // Get the user profile from the session's username
    let userArray = await userCollection.find({ username: username }).toArray();

    let user = userArray[0];

    console.log([user, user._id]);

    if (!user) {
        console.error(`Access to main with invalid username: ${username}`);
        res.redirect("/login?invalidUsername=1");
        return;
    }

    let resourcesArray = await saveCollection.find({ user_id: user._id }).project({resources: 1}).toArray();
    let researchPoints = resourcesArray[0].resources.ResearchPoints;
    console.log(resourcesArray)
    console.log(researchPoints);
    let treeArray = await treeCollection.find({ user_id: user._id }).toArray();
    let treeUnlocks = treeArray[0];
    let modsArray = await modsCollection.find({ user_id: user._id }).toArray();
    let modifiers = modsArray[0];

    res.render("techTree", {
        title: "Custom Tech Tree",
        // Since techTree is a subdirectory of main,
        // we have to go one directory up to get
        // the style sheets (and JS)
        css: ["../styles/techTree.css"],
        unlocks: treeUnlocks ? JSON.stringify(treeUnlocks.unlocks) : "[\"root\"]",
        modifiers: modifiers ? JSON.stringify(modifiers.modifiers) : "{}",
        points: researchPoints
    })
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