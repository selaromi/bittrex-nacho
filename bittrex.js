var bittrex = require('@you21979/bittrex.com');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var prompt = require('prompt');

var public_api = bittrex.PublicApi;
var private_api = bittrex.createPrivateApi(config.APIKEY, config.SECRET, "Asknacho's bot")

var AMOUNT_TO_TRADE = config.AMOUNT_TO_TRADE;
var AMOUNT_TO_TRADE_PER_COIN = config.AMOUNT_TO_TRADE_PER_COIN;
var ASK_MULTIPLIER = config.ASK_MULTIPLIER;
var BID_MULTIPLIER = config.BID_MULTIPLIER;

prompt.start();
console.log('Actions:');
console.log('1 - Check Balance');
console.log('2 - Buy');
console.log('3 - Sell');
console.log('4- Buy coins about from Pump It');
prompt.get(['action'], function (err, result) {
  switch (Number(result.action)) {
    case 1:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        private_api.getBalance(coin).then(( { Available } ) =>
          console.log(coin+' Available: ', Available)
        );
      });
      break;

    case 2:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        var market = 'BTC-'.concat(coin);
        public_api.getTicker(market).then(({ Ask }) => {
          console.log('Buying '+AMOUNT_TO_TRADE/(Ask*ASK_MULTIPLIER)+' @ rate: '+Ask*ASK_MULTIPLIER);
          // private_api.buyLimit(market,AMOUNT_TO_TRADE/(Ask*ASK_MULTIPLIER),Ask*ASK_MULTIPLIER)
          // .then(console.log)
          // .catch(function(e){
          //     console.log(e.message)
          // })
        });
      });
      break;

    case 3:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        private_api.getBalance(coin).then(( balance ) => {
          var market = 'BTC-'.concat(coin);
          public_api.getTicker(market).then(({ Last }) => {
            console.log('Selling '+balance.Available+' @ rate: '+Last);
            // private_api.sellLimit(market,balance.Available,Last)
            // .then(console.log)
            // .catch(function(e){
            //     console.log(e.message)
            // })
          });
        });
      });
      break;

    case 4:
      prompt.get(['coins'], function (err, result) {
        var coins = result.coins.split(",").map((coin) => coin.substring(coin.lastIndexOf("=")+1,coin.length));
        coins.forEach(function(coin) {
          var market = 'BTC-'.concat(coin);
          public_api.getTicker(market).then(({ Ask }) => {
            console.log('Set order for '+market+', check at https://bittrex.com/Market/Index?MarketName='+market);
            console.log('Bought '+AMOUNT_TO_TRADE_PER_COIN/Ask+' @ '+Ask);
            private_api.buyLimit(market, AMOUNT_TO_TRADE_PER_COIN/Ask, Ask);
          })
        });
      });
      break;
    default:
      console.log('No action Selected')
      break;
  }
});
