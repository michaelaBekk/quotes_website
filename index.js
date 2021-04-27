//Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT} `);
});

app.use(express.static('public'));

//CSS Folder
app.use(express.static('public'));

//Body Parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

//Cookie Parser 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Connect to DB
require('./connection');

// Routes
require('./routes')(app);

