## About Us
Team Name: BBY-10
Team Members: 
- Darion Delorme Set 2C
- Marcy Ordinario Set 2B
- Alex Hidalgo Set 2A
- Glenn Dossot
- Caroline (Cyrus) Bastiaanssen Set 2A

## File Structure
Put all front-end files into the `/public` directory.
(Raw HTML files, CSS, images, fonts, etc.)
Put these files into their respective folders; E.g. `.html` files in `/public/html`, `.css` files in `/public/styles`.
If no directory exists, create one with an appropriate name.

## How to run locally with node
Update this section as you work and add dependencies.
Make sure you update the package requirements in the code block below.
Don't make us have to check the dependencies manually.

Code blocks are run in console in the root of the project directory.

### Setup project locally (do this once)
Make sure you have your `.env` file set up properly.
To do so, make sure you properly configure your MongoDB and import the necessary variables.
```bash
npm i
npm i express express-session connect-mongo bcrypt joi dotenv
```

### Run using Nodemon
```bash
npm i
nodemon index.js
```
