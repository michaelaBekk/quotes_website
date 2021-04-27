// Config File
const config = require('./config');

module.exports = (to, subject, template, id) => {
      let transporter = nodemailer.createTransport(config.nodemailer);

      const emailOptions = {
            from: {
                  name: 'Daily Motivational Quotes',
                  address:'dailymotivationalquotestoday@gmail.com'
            },
            to,
            subject,
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