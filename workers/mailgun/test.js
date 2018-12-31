var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

mailgun.mail.send({
  to: 'morion4000@gmail.com',
  subject: 'test',
  body: 'test'
}, null, console.log);
