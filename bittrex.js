var bittrex = require('@you21979/bittrex.com');
var socket_bittrex = require('./node_modules/node.bittrex.api/node.bittrex.api.js');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var prompt = require('prompt');

var public_api = bittrex.PublicApi;
var private_api = bittrex.createPrivateApi(config.APIKEY, config.SECRET, "Asknacho's bot")

var AMOUNT_TO_TRADE = config.AMOUNT_TO_TRADE;
var AMOUNT_TO_TRADE_PER_COIN = config.AMOUNT_TO_TRADE_PER_COIN;
var ASK_MULTIPLIER = config.ASK_MULTIPLIER;
var BID_MULTIPLIER = config.BID_MULTIPLIER;

socket_bittrex.options({
  'apikey' : config.APIKEY,
  'apisecret' : config.SECRET,
  'stream' : true, // will be removed from future versions
  'verbose' : true,
  'cleartext' : false
});

prompt.start();
console.log('using: '+process.argv[2]);
console.log('AMOUNT_TO_TRADE: '+AMOUNT_TO_TRADE+' ASK_MULTIPLIER: '+ASK_MULTIPLIER);
console.log('AMOUNT_TO_TRADE_PER_COIN: '+AMOUNT_TO_TRADE_PER_COIN);
console.log('Actions:');
console.log('1 - Check Balance');
console.log('2 - Check Balance for all coins');
console.log('3 - Buy');
console.log('4 - Sell');
console.log('5 - Market Sell');
console.log('6 - Buy coins about from Pump It');
console.log('7 - Socket');
prompt.get(['action'], function (err, result) {
  switch (Number(result.action)) {
    /*
      Single Coin Balance
    */
    case 1:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        private_api.getBalance(coin).then(( { Available } ) =>
          console.log(coin+' Available: ', Available)
        );
      });
      break;

    /*
      Balance for all Coins
    */
    case 2:
      console.log('Balance of the coins');
      private_api.getBalances().then( (data) =>
        data.filter(({ Balance }) => Balance > 0 )
            .forEach((coin) => console.log(coin.Currency,coin.Balance))
      );
      break;

    /*
      Limit buy for Coin
    */
    case 3:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        var market = 'BTC-'.concat(coin);
        public_api.getTicker(market).then(({ Ask }) => {
          console.log('Buying '+AMOUNT_TO_TRADE/(Ask*ASK_MULTIPLIER)+' @ rate: '+Ask*ASK_MULTIPLIER);
          private_api.buyLimit(market,AMOUNT_TO_TRADE/(Ask*ASK_MULTIPLIER),Ask*ASK_MULTIPLIER)
          .then(console.log)
          .catch(function(e){
              console.log(e.message)
          })
        });
      });
      break;

    /*
      Limit sell for Coin
    */
    case 4:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        private_api.getBalance(coin).then(( balance ) => {
          var market = 'BTC-'.concat(coin);
          public_api.getTicker(market).then(({ Last }) => {
            console.log('Selling '+balance.Available+' @ rate: '+Last);
            private_api.sellLimit(market,balance.Available,Last)
            .then(console.log)
            .catch(function(e){
                console.log(e.message)
            })
          });
        });
      });
      break;

    /*
      Market sell for Coin
    */
    case 5:
      console.log('Abr of the coin: (ex: LTC)');
      prompt.get(['coin'], function (err, result) {
        var coin = result.coin;
        private_api.getBalance(coin).then(( balance ) => {
          var market = 'BTC-'.concat(coin);
          private_api.sellMarket(market,balance.Available)
          .then(console.log)
          .catch(function(e){
              console.log(e.message)
          })
        });
      });
      break;

    /*
      https://t.me/pump_it buy all coins and set ask at 1.07 of the paid price
    */
    case 6:
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

    case 7:
      socket_bittrex.websockets.subscribe(['BTC-ETH','BTC-SC','BTC-ZEN'], function(data) {
      if (data.M === 'updateExchangeState') {
        data.A.forEach(function(data_for) {
          console.log('Market Update for '+ data_for.MarketName, data_for);
        });
      }
      });
      break;

    default:
      console.log('No action Selected')
      break;
  }
});
