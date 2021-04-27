
//Send Emails
const nodemailer = require('nodemailer');
const cron = require('node-cron');

     //Get Random Quotes
    const fetch = require('isomorphic-fetch');
    getQuotes();
    async function getQuotes() {
        const response = await fetch('https://type.fit/api/quotes', {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
        })
        const quotes_data = await response.json();

      var quotes_arr = quotes_data.map(value => {
         return [
           value.text    
        ];
      });
      var authors_arr = quotes_data.map(value => {
        return [
          value.author     
       ];
     });
    
      const randomNumber = Math.floor((Math.random() * 1643));
      let randomQuote= quotes_arr[randomNumber];
      let randomAuthor = authors_arr[randomNumber];

      mySqlDb.query('SELECT Emails, User_ID FROM subscribers', (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
          const subscriber = result.map(value => {
            return [
              value.Emails,
              value.User_ID
            ]
          });
          
            let transporter = nodemailer.createTransport(
                data[1]
            );
      
              const emailOptions = {
                from: {
                  name: 'Daily Quote',
                  address:'dailymotivationalquotestoday@gmail.com'
                },
                to: subscriber[0][0],
                subject:'Your Daily Motivational Quote',
                attachments: [{
                  filename:'leaves.png',
                  path: 'public/images/leaves.png',
                  cid: 'flowerdesign@blah',
                  contentDisposition: 'inline'
              }],
                html: pug.renderFile(__dirname + '/views/email-template.pug', {
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
        })
      }
