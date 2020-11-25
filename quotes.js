
//Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT} `);
});

//CSS Folder
app.use(express.static('public'));

//Body Parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

//Cookie Parser 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Express Validator 
const {check, validationResult} = require('express-validator');

//Pug
const pug = require('pug');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('submit');
});

//Retrieve Data

app.get('/subscribers', (req, res,) => {
  database.find({}, (err, data) => {
        if(err) {
          console.error('Failed to retrieve data, try again.');
        }
    });
    res.redirect('/');
  
});

//Error Middleware

app.use((err, req, res, next) => {
   res.status(404).render('error', {fileError:404});
});

app.use((err, req, res, next) => {
  res.status(500).render('error', {serverError:500});
});

// Config File
var data = require('./config');

//My SQL
var mySql = require('mysql');

var mySqlDb = mySql.createConnection(
    data[0]
);

mySqlDb.connect(function(err) {
    if (err) {
        console.log(err, 'Failed to connect to database')
    }
    console.log("Connected!");
});

mySqlDb.query(`USE defaultdb`);

// Generate User_ID
function makeID(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Subscribe Email
app.post('/', [
  check('email').notEmpty(),
  check('email').isEmail()
],(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return;
  }else {
    // Check if subscriber exists
    mySqlDb.query(`SELECT Emails FROM subscribers WHERE Emails='${req.body.email}'`, (err, result) => {
      if(err) throw err;
      if(result.length > 0) {
        res.render('submit', {email_exists: true});
      }else {
        let randomNumber = Math.floor(Math.random() * 15) + 9;
        let user_ID = makeID(randomNumber);
        mySqlDb.query(`INSERT INTO subscribers VALUES('${req.body.email}', '${user_ID}')`, (err, email) => {
          if(err) {
            throw err;
          }else {
             // Send Confirmation Email
            res.render('submit', {email:req.body});
            let transporter = nodemailer.createTransport(
              data[1]
            );
    
              const emailOptions = {
                from: {
                  name: 'Daily Quote',
                  address:'dailymotivationalquotestoday@gmail.com'
                },
                to: req.body.email,
                subject:'Daily Quotes Confirmation',
                html: pug.renderFile(__dirname + '/views/confirmation-email.pug', {
                  id: user_ID
                })
            }
    
            transporter.sendMail(emailOptions, (err, info) => {
              if(err) {
                console.log('Confirmation Email failed to send' + err);
              }else {
                console.log('Confirmation Email sent!' + info.response);
              }
            });
          }
        })
      }
    })
  }
});


// Unsubscribe Survey + Remove Email


// Unsubscribe -----------------
app.get('/unsubscribe/:id', (req, res) => {
  res.render('unsubscribe', {id: req.params.id})
});


app.post('/successfully-unsubscribed/:id', (req, res) => {
  const reqs = [req.body.firstOption, req.body.secondOption, req.body.thirdOption, req.body.fourthOption];

  mySqlDb.query(`SELECT No_longer_wish_to_recieve, Never_signed_up, Spam, Inappropriate_content FROM survey`, (err, result) => {
    if(err) throw err;
    const options = result.map(value => {
      return [
        value.No_longer_wish_to_recieve,
        value.Never_signed_up,
        value.Spam,
        value.Inappropriate_content
      ];
    })

    for(let i=0; i < reqs.length; i++) {
      if(reqs[i]) {
        options[0][i] += 1;
      }
    }
    mySqlDb.query(`UPDATE survey SET No_longer_wish_to_recieve='${options[0][0]}', Never_signed_up='${options[0][1]}', Spam='${options[0][2]}', Inappropriate_content= '${options[0][3]}'`);
  })

  mySqlDb.query(`INSERT INTO additional_survey VALUES('${req.body.other}', '${req.params.id}')`);

  // Delete Unsubscriber
  mySqlDb.query(`DELETE FROM subscribers WHERE User_ID= '${req.params.id}'`, (err, complete) => {
    if(err) {
      res.render('error', {serverError:500});
    }else {
      res.render("unsubscribe", {message: "Unsubscribed Successfully."})
    }
  })  
});