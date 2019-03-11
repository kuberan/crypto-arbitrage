var unirest = require('unirest');
var assert = require('assert');
var arbitrageFunctions = require('./arbitrage_functions');

function run()
{
	var utcTimeStampMs = (new Date()).getTime();
	var dateStr = (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString();

	unirest.get('https://api.binance.com/api/v3/ticker/bookTicker')
	.end(function (response) {
		if(response.error)
		{
			console.log(response.error);
			return;
		}
  		//console.log(response.body);
		var jsonStr = response.body;
		var doc = {'timestamp': utcTimeStampMs, 'time_pst': dateStr, 'binanceOrderData': jsonStr};
		arbitrageFunctions.findTriangularArbitrage(doc.timestamp, doc.binanceOrderData, checkOrderQuantity=true, profitThresholdPercent=0.0, baseCurrency='USDT', debug=true, feePercent=0.3, callback=null);
	});
}


setInterval(run, 1000);
