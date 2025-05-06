# About Us
Team Name: BBY-10
Team Members: 
- Darion Delorme Set 2C
- Marcy Ordinario Set 2B
- Alex Hidalgo Set 2A
- Glenn Dossot Set 2C
- Caroline (Cyrus) Bastiaanssen Set 2A

# File Structure
Put all front-end files into the `/public` directory.
(Raw HTML files, CSS, images, fonts, etc.)
Put these files into their respective folders; E.g. `.html` files in `/public/html`, `.css` files in `/public/styles`.
If no directory exists, create one with an appropriate name.

# How to run locally with node
Code blocks are run in console in the root of the project directory.

When running the project using node, make sure to run the following command to install the needed modules.
```bash
npm i
```

Afterwards, make sure you properly set up your `.env` file from the given `sample.env` with the proper GUIDs and MongoDB connection parameters.

To run the project locally, use either of the following commands:
```bash
node index.js

nodemon index.js
```