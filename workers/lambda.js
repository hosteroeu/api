exports.coingecko_coins_update = async function (event, context) {
  require("./coingecko/coins_update");

  return context.logStreamName;
};
