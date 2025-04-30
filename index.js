// declare package requirements
const express = require('express');
const path = require('path');

// ensure port
const port = process.env.PORT || 3000;

const app = express();

// ensure we can read from forms
app.use(express.urlencoded({extended: false}));

// ensure public directory for styles/content delivery
app.use(express.static(__dirname + "/public"));

// landing page
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

/* 
 * other page serving functions go here. 
 * Things like post functions for forms can be placed here,
 * while game logic and user registration can be moved to other .js files.
 */

// 404 page
app.use(function (req, res) {
    res.status(404).send("Page not found - 404"); // TODO make a 404 page to send instead of just this line
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});