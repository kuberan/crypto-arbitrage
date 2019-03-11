var unirest = require('unirest');
var assert = require('assert');

var tradeChains = [];
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'BTC_CNYX', 'thirdLeg': 'BTC_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'ETH_CNYX', 'thirdLeg': 'ETH_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'EOS_CNYX', 'thirdLeg': 'EOS_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'BCH_CNYX', 'thirdLeg': 'BCH_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'XRP_CNYX', 'thirdLeg': 'XRP_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'DOGE_CNYX', 'thirdLeg': 'DOGE_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'BCHSV_CNYX', 'thirdLeg': 'BCHSV_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'PAX_CNYX', 'thirdLeg': 'PAX_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'USDC_CNYX', 'thirdLeg': 'USDC_USDT'});
tradeChains.push({'firstLeg': 'USDT_CNYX', 'secondLeg': 'TUSD_CNYX', 'thirdLeg': 'TUSD_USDT'});

function run()
{
	unirest.get('https://data.gateio.co/api2/1/tickers')
	.end(function (response) {
		if(response.error)
		{
			console.log(response.error);
			return;
		}
		var firstLeg = 'usdt_cnyx';
		tradeChains.forEach((chain) => {
			var secondLeg = chain.secondLeg.toLowerCase();
			var thirdLeg = chain.thirdLeg.toLowerCase();
	
			//USDT
			//var firstLegSellQuantity = 100.00;
			//CNYX balance from first Leg
			//var secondLegBuyQuantity = firstLegSellQuantity * response.body[firstLeg].highestBid;
			//XXX balance from second leg	
			//var thirdLegSellQuantity = secondLegBuyQuantity / response.body[secondLeg].lowestAsk;
			//USDT balance from third leg
			//var balance = thirdLegSellQuantity * response.body[thirdLeg].highesBid;
			
			var usdtStartAmount = 100.0;
			var balance = usdtStartAmount * response.body[firstLeg].highestBid / response.body[secondLeg].lowestAsk * response.body[thirdLeg].highestBid;

			//console.log(balance);
			if (balance > usdtStartAmount)
			{
				console.log(firstLeg);
                        	console.log(response.body[firstLeg]);
                        	console.log(secondLeg);
                        	console.log(response.body[secondLeg]);
                        	console.log(thirdLeg);
                        	console.log(response.body[thirdLeg]);
				console.log(balance);
			}
			
		});
		//response.body.forEach((d) => { console.log(d);   });
	});
}


setInterval(run, 1000);
//run();
