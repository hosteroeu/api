var rancher = require('./../../services').Rancher();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

var account_model = require('./../../models').account.model;
var host_model = require('./../../models').host.model;
var miner_model = require('./../../models').miner.model;

var demo_account_id = 427;
var demo_account_user_id = 'auth0|5c62cb4dfafc067adaa778e7';

account_model.update({
    auto_deploy: 1,
    auto_deploy_coin: 'webdollar',
    auto_deploy_idle: 1,
    auto_deploy_coin_idle: 'yenten',
    default_processor: 'sse2',
    wallet_nerva: 'NV1LLwjyTdbSr6xqU9pHoddTdzFvXd4Mk86xgZ6d2bzoJBokGBun9pQYxAgB2PJ23nVZ4zF414pVHggeVLRWJC8S1Yaadwyce',
    wallet_webdollar: 'WEBD$gCET26qgUFLE5dNUo8aGrn0ZPGQQueFYuj$',
    mining_pool_url_webdollar: 'https://webdmine.io/pool/1/BACMpool/0.01/21dc1f57cb7338963ea159877b4ade97b71dd11ac17292e3852bdc33a26a17e4/https:$$pool.bacm.ro:443',
    password_webdollar: null,
    wallet_webchain: '0xdd4a6ec2eb9c76178fbf7cc40591aefb0898093f',
    password_webchain: 'demo',
    mining_pool_url_webchain: 'pool.webchain.network:2222',
    wallet_veruscoin: 'RMay9eXAn5u94pxvTbBwr1Y5ZDY2Sjuhx7',
    password_veruscoin: 'x',
    mining_pool_url_veruscoin: 'eu.luckpool.net:3956',
    wallet_credits: 'morion4000.hostero',
    password_credits: 'x',
    mining_pool_url_credits: 'stratum+tcp://crds.suprnova.cc:2771',
    wallet_myriad: '4uhfKZ8EYVkGueHMerzNKERr9AX5Pc1iSj',
    password_myriad: 'x',
    mining_pool_url_myriad: 'stratum+tcp://stratum.eu.miners-pool.eu:8428',
    wallet_yenten: 'morion4000.hostero',
    password_yenten: 'x',
    mining_pool_url_yenten: 'stratum+tcp://stratum.luckypool.org:3333',
    wallet_globalboost: 'morion4000.hostero',
    password_globalboost: 'x',
    mining_pool_url_globalboost: 'hub.miningpoolhub.com:20543'
  }, {
    where: {
      id: demo_account_id
    }
  })
  .then(console.log)
  .catch(console.error);

miner_model.destroy({
    where: {
      user_id: demo_account_user_id
    }
  })
  .then(console.log)
  .catch(console.error);

host_model.destroy({
    where: {
      user_id: demo_account_user_id
    }
  })
  .then(console.log)
  .catch(console.error);
