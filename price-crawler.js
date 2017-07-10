var bittrex = require('./node_modules/node.bittrex.api/node.bittrex.api.js');
var redis = require("redis");
var client = redis.createClient();
var ONLY_BTC = /BTC\-/

bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        if (ONLY_BTC.test(marketsDelta.MarketName)) {
          client.set(marketsDelta.MarketName, marketsDelta.Ask);
        }
      });
    });
  }
});
