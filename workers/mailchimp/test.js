var mailchimp = require('./../../services').Mailchimp();
var config = require('./../../config');

mailchimp.lists.subscribe({
  email: 'mada.moraru93@gmail.com',
  first_name: 'test',
  last_name: 'test'
}, null, console.log);
