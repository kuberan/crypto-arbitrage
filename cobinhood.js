var unirest = require('unirest');
var assert = require('assert');

var tradeChainsBSS = [];
//buy, sell, sell
tradeChainsBSS.push({'firstLeg': 'COB-USD', 'secondLeg': 'COB-BTC', 'thirdLeg': 'BTC-USD'});
tradeChainsBSS.push({'firstLeg': 'COB-USD', 'secondLeg': 'COB-ETH', 'thirdLeg': 'ETH-USD'});
tradeChainsBSS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'ETH-USDT', 'thirdLeg': 'USDT-USD'});
tradeChainsBSS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'ETH-BTC', 'thirdLeg': 'BTC-USD'});
tradeChainsBSS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'BTC-USDT', 'thirdLeg': 'USDT-USD'});
tradeChainsBSS.push({'firstLeg': 'ETH-USDT', 'secondLeg': 'ETH-BTC', 'thirdLeg': 'BTC-USDT'});

var tradeChainsBBS = [];
//buy, buy, sell
tradeChainsBBS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'COB-ETH', 'thirdLeg': 'COB-USD'});
tradeChainsBBS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'COB-BTC', 'thirdLeg': 'COB-USD'});
tradeChainsBBS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'ETH-BTC', 'thirdLeg': 'ETH-USD'});
tradeChainsBBS.push({'firstLeg': 'USDT-USD', 'secondLeg': 'BTC-USDT', 'thirdLeg': 'BTC-USD'});
tradeChainsBBS.push({'firstLeg': 'USDT-USD', 'secondLeg': 'ETH-USDT', 'thirdLeg': 'ETH-USD'});
tradeChainsBBS.push({'firstLeg': 'BTC-USDT', 'secondLeg': 'ETH-BTC', 'thirdLeg': 'ETH-USDT'});

var tradeChainsBBSS = [];
//buy, buy, sell, sell
tradeChainsBBSS.push({'firstLeg': 'COB-USD', 'secondLeg': 'CMT-COB', 'thirdLeg': 'CMT-BTC', 'fourthLeg': 'BTC-USD'});
tradeChainsBBSS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'UTNP-ETH', 'thirdLeg': 'UTNP-BTC', 'fourthLeg': 'BTC-USD'});
tradeChainsBBSS.push({'firstLeg': 'ETH-USDT', 'secondLeg': 'UTNP-ETH', 'thirdLeg': 'UTNP-BTC', 'fourthLeg': 'BTC-USDT'});
tradeChainsBBSS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'CMT-BTC', 'thirdLeg': 'CMT-COB', 'fourthLeg': 'COB-USD'});
tradeChainsBBSS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'UTNP-BTC', 'thirdLeg': 'UTNP-ETH', 'fourthLeg': 'ETH-USD'});
tradeChainsBBSS.push({'firstLeg': 'BTC-USDT', 'secondLeg': 'UTNP-BTC', 'thirdLeg': 'UTNP-ETH', 'fourthLeg': 'ETH-USDT'});
tradeChainsBBSS.push({'firstLeg': 'USDT-USD', 'secondLeg': 'ETH-USDT', 'thirdLeg': 'ETH-BTC', 'fourthLeg': 'BTC-USD'});

var tradeChainsBBBS = [];
//buy, buy, buy, sell
tradeChainsBBBS.push({'firstLeg': 'USDT-USD', 'secondLeg': 'BTC-USDT', 'thirdLeg': 'ETH-BTC', 'fourthLeg': 'ETH-USD'});

function run()
{
	var tickerData = {};
	unirest.get('https://api.cobinhood.com/v1/market/tickers')
	.end(function (response) {
		if(response.error)
		{
			console.log(response.error);
			return;
		}
		response.body.result.tickers.forEach((d) => { tickerData[d.trading_pair_id] = d; });

		var startingUSD = 100.0;

		//buy, sell, sell
		tradeChainsBSS.forEach((tradeChain) => {
			var result = startingUSD / tickerData[tradeChain.firstLeg].lowest_ask;
			result = result * tickerData[tradeChain.secondLeg].highest_bid;
			result = result * tickerData[tradeChain.thirdLeg].highest_bid;
			if (result > startingUSD)
			{
				console.log(tradeChain.firstLeg + ' -> ' + tradeChain.secondLeg + ' -> ' + tradeChain.thirdLeg);
				console.log(tickerData[tradeChain.firstLeg]);
				console.log(tickerData[tradeChain.secondLeg]);
				console.log(tickerData[tradeChain.thirdLeg]);
				console.log(result);
			}
		});

		

		//buy, buy, sell
		tradeChainsBBS.forEach((tradeChain) => {
			var result = startingUSD /  tickerData[tradeChain.firstLeg].lowest_ask;
			result = result / tickerData[tradeChain.secondLeg].lowest_ask;
			result = result * tickerData[tradeChain.thirdLeg].highest_bid;
			if (result > startingUSD)
                        {
				console.log(tradeChain.firstLeg + ' -> ' + tradeChain.secondLeg + ' -> ' + tradeChain.thirdLeg);
				console.log(tickerData[tradeChain.firstLeg]);
                        	console.log(tickerData[tradeChain.secondLeg]);
                        	console.log(tickerData[tradeChain.thirdLeg]);
				console.log(result);
			}
		});	

		//buy, buy, sell, sell
		tradeChainsBBSS.forEach((tradeChain) => {
			var result = startingUSD /  tickerData[tradeChain.firstLeg].lowest_ask;
			result = result / tickerData[tradeChain.secondLeg].lowest_ask;
			result = result * tickerData[tradeChain.thirdLeg].highest_bid;
			result = result * tickerData[tradeChain.fourthLeg].highest_bid;
			if (result > startingUSD)
                        {
				console.log(tradeChain.firstLeg + ' -> ' + tradeChain.secondLeg + ' -> ' + tradeChain.thirdLeg + ' -> ' + tradeChain.fourthLeg);
				console.log(tickerData[tradeChain.firstLeg]);
                                console.log(tickerData[tradeChain.secondLeg]);
                                console.log(tickerData[tradeChain.thirdLeg]);
				console.log(tickerData[tradeChain.fourthLeg]);
                        	console.log(result);
			}
		});

		//buy, buy, buy, sell
		tradeChainsBBBS.forEach((tradeChain) => {
			var result = startingUSD /  tickerData[tradeChain.firstLeg].lowest_ask;
			result = result / tickerData[tradeChain.secondLeg].lowest_ask;
			result = result / tickerData[tradeChain.thirdLeg].lowest_ask;
			result = result * tickerData[tradeChain.fourthLeg].highest_bid;
			if (result > startingUSD)
                        {
				console.log(tradeChain.firstLeg + ' -> ' + tradeChain.secondLeg + ' -> ' + tradeChain.thirdLeg + ' -> ' + tradeChain.fourthLeg);
				console.log(tickerData[tradeChain.firstLeg]);
                                console.log(tickerData[tradeChain.secondLeg]);
                                console.log(tickerData[tradeChain.thirdLeg]);
                                console.log(tickerData[tradeChain.fourthLeg]);
                        	console.log(result);
			}
		});
	});
}

setInterval(run, 1000);
//run();
