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

const {check, validationResult} = require('express-validator');
const config = require('./config');

// Generate User_ID
function makeID(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const  charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
}

//My SQL
const mySql = require('mysql');

const mySqlDb = mySql.createConnection(config.development);

mySqlDb.connect(function(err) {
    if (err) {
        console.log(err, 'Failed to connect to MySQL')
    }
    console.log("Connected to MySQL!");
});

mySqlDb.query(`USE ${config.development.database}`);

// Nodemailer
function sendEmail(to, subject, template) {
  let transporter = nodemailer.createTransport(config.nodemailer);

  const emailOptions = {
    from: {
      name: 'Daily Motivational Quotes',
      address:'dailymotivationalquotestoday@gmail.com'
    },
    to,
    subject,
    html: pug.renderFile(__dirname + template, {
        id: subscriber[0][1],
        quote: randomQuote,
        author: randomAuthor
    })
  }

  transporter.sendMail(emailOptions, (err, info) => {
        if(err) {
          console.log('Email failed to send' + err);
        }else {
          console.log('Email sent!' + info.response);
        }
  });
}


// Routes 
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('submit');
});

  // app.get('/email-sample', (req, res) => {
  //       res.render('email-template');
  // });
    
  //Retrieve Data
  app.get('/subscribers', (req, res,) => {
    database.find({}, (err, data) => {
          if(err) {
                console.error('Failed to retrieve data, try again.');
          }
    });
    res.redirect('/');
  });
  
//Subscribe Email
app.post('/', [
    check('email').notEmpty().isEmail(),
  ],(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return;
    }else {
      // Check if subscriber exists
      mySqlDb.query(`SELECT email FROM subscribers WHERE email='${req.body.email}'`, (result, err) => {
        if(err) {
          console.log(err);
        }

        if(result) {
          res.render('submit', {email_exists: true});
        }else {
          let randomNumber = Math.floor(Math.random() * 15) + 9;
          let user_ID = makeID(randomNumber);
          mySqlDb.query(`INSERT INTO subscribers VALUES('${req.body.email}', '${user_ID}')`);
          res.render('submit', {email:req.body});
          sendEmail(req.body.email, 'Thank you for subscribing', '/views/email-template.pug');
        }
      });
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


