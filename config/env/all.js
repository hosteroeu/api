module.exports = {
  version: 'v1',
  port: 8080,
  rancher: {
    default: 'europe1',
    london1: {
      key: '',
      secret: '',
      host: 'http://europe1.hostero.eu:8080/v1',
      project: 'http://europe1.hostero.eu:8080/v1/projects/1a1372208'
    },
    europe1: {
      key: '',
      secret: '',
      host: 'http://europe1.hostero.eu:8080/v1',
      project: 'http://europe1.hostero.eu:8080/v1/projects/1a7'
    }
  },
  cloudflare: {
    email: ',
    key: '',
    zone: ''
  },
  mailgun: {
    key: '',
    url: 'https://api.mailgun.net/v3/mg.hostero.eu',
    domain: ''
  },
  mailchimp: {
    key: '',
    subscribers_list: ''
  },
  admin: {
    email: 'hosteroeu@gmail.com',
    user_id: 'auth0|5c4459b46b7b7c0da8244235'
  },
  webdollar: {
    payments_address: 'WEBD$gCET26qgUFLE5dNUo8aGrn0ZPGQQueFYuj$'
  },
  webdscan: {
    token: ''
  },
  crypto: {
    algo: 'aes256',
    key: ''
  },
  etherscan: {
    key: '',
    url: 'http://api.etherscan.io/api'
  }
};
