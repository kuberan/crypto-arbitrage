var unirest = require('unirest');
var assert = require('assert');

const Client = require('node-cobinhood');
let client = new Client({ key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW5faWQiOiJmNjI0ZmRkNS0wODVlLTQ2ZGQtOTI0MC1kOTc2YzVmNDRlMjciLCJzY29wZSI6WyJzY29wZV9leGNoYW5nZV90cmFkZV9yZWFkIiwic2NvcGVfZXhjaGFuZ2VfdHJhZGVfd3JpdGUiLCJzY29wZV9leGNoYW5nZV9vYXV0aDJfY2xpZW50X3JlYWQiLCJzY29wZV9leGNoYW5nZV9vYXV0aDJfY2xpZW50X3dyaXRlIl0sInVzZXJfaWQiOiI1MzMxYThlZS1mMjYzLTQ3MDMtOWVjZS03NjVmMTI5ZWRlZWQifQ.tVFgka4j84S_fAUD9Gi6Md1vqNUF5Nxl6k3zTNMlQ_4.V2:a9e07e63edf4a3f66c91c866252190bd1e40aabe4fa7fd343e243752a3f79eba', disableWS: true});

var tradeChainsBSS = [];
//buy, sell, sell
//tradeChainsBSS.push({'firstLeg': 'COB-USD', 'secondLeg': 'COB-BTC', 'thirdLeg': 'BTC-USD'});
//tradeChainsBSS.push({'firstLeg': 'COB-USD', 'secondLeg': 'COB-ETH', 'thirdLeg': 'ETH-USD'});
//tradeChainsBSS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'ETH-USDT', 'thirdLeg': 'USDT-USD'});
//tradeChainsBSS.push({'firstLeg': 'ETH-USD', 'secondLeg': 'ETH-BTC', 'thirdLeg': 'BTC-USD'});
//tradeChainsBSS.push({'firstLeg': 'BTC-USD', 'secondLeg': 'BTC-USDT', 'thirdLeg': 'USDT-USD'});
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

		var startingUSD = 50.0;

		//buy, sell, sell
		tradeChainsBSS.forEach((tradeChain) => {
			var result = startingUSD / tickerData[tradeChain.firstLeg].lowest_ask;
			result = result * tickerData[tradeChain.secondLeg].highest_bid;
			result = result * tickerData[tradeChain.thirdLeg].highest_bid;
			//if (result > startingUSD)
			//{
				console.log(tradeChain.firstLeg + ' -> ' + tradeChain.secondLeg + ' -> ' + tradeChain.thirdLeg);
				console.log(tickerData[tradeChain.firstLeg]);
				console.log(tickerData[tradeChain.secondLeg]);
				console.log(tickerData[tradeChain.thirdLeg]);
				console.log(result);
			//}
			client.placeLimitOrder(tradeChain.firstLeg, 'bid', tickerData[tradeChain.firstLeg].lowest_ask, startingUSD / tickerData[tradeChain.firstLeg].lowest_ask, 'exchange').then(function(result) {
				console.log(result);
				console.log("second leg count: " +  startingUSD / tickerData[tradeChain.firstLeg].lowest_ask);
				var waitTill = new Date(new Date().getTime() + 50);
				while(waitTill > new Date()){}
        			client.placeLimitOrder(tradeChain.secondLeg, 'ask', tickerData[tradeChain.secondLeg].highest_bid, startingUSD / tickerData[tradeChain.firstLeg].lowest_ask, 'exchange').then(function(result) {
					console.log(result);
					console.log('third leg count: ' + startingUSD / tickerData[tradeChain.firstLeg].lowest_ask * tickerData[tradeChain.secondLeg].highest_bid);
					var waitTill = new Date(new Date().getTime() + 500);
					while(waitTill > new Date()){}
					client.placeLimitOrder(tradeChain.thirdLeg, 'ask', tickerData[tradeChain.thirdLeg].highest_bid, startingUSD / tickerData[tradeChain.firstLeg].lowest_ask * tickerData[tradeChain.secondLeg].highest_bid, 'exchange').then(function(result) {
						console.log(result);
					}, function(error) { console.log(error); });
                        	}, function(error) { console.log(error); });
			}, function(error) { console.log(error); });
                        });

		//buy, buy, sell
		/*tradeChainsBBS.forEach((tradeChain) => {
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
		});*/
	});
}

//setInterval(run, 1000);
run();
