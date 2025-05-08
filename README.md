# About Us
Team Name: BBY-10
Team Members: 
- Darion Delorme Set 2C
- Marcy Ordinario Set 2B
- Alex Hidalgo Set 2A
- Glenn Dossot Set 2C
- Caroline (Cyrus) Bastiaanssen Set 2A

# File Structure
Put all front-end files into the `/public` directory. (.HTML files, .CSS, images, fonts, etc.)
Put these files into their respective folders; E.g. `.html` files in `/public/html`, `.css` files in `/public/styles`.
If no directory exists, create one with an appropriate name.

# How to run locally with node

Code blocks are run in console in the root of the project directory.

## Setup project locally
Make sure you have your `.env` file set up properly with the necessary GUIDs and MongoDB connection parameters

To do so, get the needed information from one of the project members for the shared project database.

To run the porject using `node`, run the following commands in the project directory:
```bash
npm i
node index.js
```

If you prefer to use `nodemon`, use the following command instead:
```bash
nodemon index.js
```
