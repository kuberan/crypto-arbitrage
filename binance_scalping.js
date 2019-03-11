const binance = require('node-binance-api')().options({
  APIKEY: 'tQfISqrkPSJ6e4aiLbtGQa6hGCmgnWg6c2aPZvSfMKdFrsSRsyNBMRrv7SY7zoe8',
  APISECRET: '0U2H7AFda9iAZNxrjX9bEL2D3tdL4wjvf7tkKZENM4Flkgfu6ExKj6Z7wbqsAgka',
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});

/*binance.websockets.depthCache(['BNBUSDT', 'BNBBTC', 'BTCUSDT'], (symbol, depth) => {
  let bids = binance.sortBids(depth.bids);
  let asks = binance.sortAsks(depth.asks);
  console.log(symbol+" depth cache update");
  console.log("bids", bids);
  console.log("asks", asks);
  console.log("best bid: "+binance.first(bids));
  console.log("best ask: "+binance.first(asks));
});*/

/*binance.websockets.miniTicker(markets => {
  console.log(markets.BNBBTC);
});*/

/*binance.balance((error, balances) => {
	if ( error ) return console.error(error);
	console.log("USDT balance: ", balances.USDT);
  	console.log("BNB balance: ", balances.BNB);
	console.log("BTC balance: ", balances.BTC);	
});*/

/*binance.bookTickers((error, ticker) => {
	console.log("Price of BNB: ", ticker.BNBBTC);
});*/

//BTCUSDT->BNBBTC->BNBUSDT

var checkArbitrageInteveralId;

function checkArbitrageSellBNB(btcBalance, usdtBalance){
	binance.bookTickers((error, ticker) => {
		if ( error ) return console.error(error.body);
		var bnbAskPrice;
		var bnbSellPrice;
		var bnbBTCTick;
		var bnbUSDTTick;
		ticker.forEach((tick) => {
			if(tick.symbol == 'BNBBTC')
			{
				bnbBTCTick = tick;
				bnbAskPrice = tick.askPrice;
			}
			if(tick.symbol == 'BNBUSDT')
			{
				bnbUSDTTick = tick;
				bnbSellPrice = tick.bidPrice;
			}
		});
		var resultUSDT = btcBalance / bnbAskPrice * bnbSellPrice;
		console.log('Difference: ' + (resultUSDT - usdtBalance));
		if((resultUSDT - usdtBalance) > 0.0)
		{
			console.log(bnbBTCTick);
                	console.log(bnbUSDTTick);
                	console.log('starting USDT: ' + usdtBalance);
                	console.log('BTC after first Trade: ' + btcBalance);
                	console.log('ending USDT: ' + resultUSDT);
                	console.log('Difference: ' + (resultUSDT - usdtBalance));
			//clearInterval(checkArbitrageInteveralId);
		}
	});
}

function checkArbitrageBuyBNB(bnbBalance, usdtBalance){
        binance.bookTickers((error, ticker) => {
                if ( error ) return console.error(error.body);
                var btcBidPrice;
                var btcSellPrice;
		var bnbBTCTick;
		var btcUSDTTick;
                ticker.forEach((tick) => {
                        if(tick.symbol == 'BNBBTC')
                        {       
				bnbBTCTick = tick;
                                btcBidPrice = tick.bidPrice;
                        }
                        if(tick.symbol == 'BTCUSDT')
                        {
				btcUSDTTick = tick;
                                btcSellPrice = tick.askPrice;
                        }
                });
                var resultUSDT = bnbBalance * btcBidPrice * btcSellPrice;
                console.log('Difference: ' + (resultUSDT - usdtBalance));
		if((resultUSDT - usdtBalance) > 0.0)
		{
			console.log(bnbBTCTick);
                	console.log(btcUSDTTick);
                	console.log('starting USDT: ' + usdtBalance);
                	console.log('BNB after first Trade: ' + bnbBalance);
                	console.log('ending USDT: ' + resultUSDT);
                	console.log('Difference: ' + (resultUSDT - usdtBalance));
                        clearInterval(checkArbitrageInteveralId);
                }
        });
}


function runSellBNB()
{
	var usdtBalance = 0.0;
	var bnbBalance = 0.0;
	var btcBalance = 0.0;
	binance.balance((error, balances) => {
        	if ( error ) return console.error(error.body);

		usdtBalance = balances.USDT.available;
		bnbBalance = balances.BNB.available;
		btcBalance = balances.BTC.available;

        	console.log("USDT balance: ", balances.USDT);
        	console.log("BNB balance: ", balances.BNB);
        	console.log("BTC balance: ", balances.BTC);

		binance.bookTickers('BTCUSDT', (error, ticker) => {
  			console.log("bookTickers", ticker);

			var quantity = parseFloat(usdtBalance / ticker.askPrice * 0.98).toFixed(6);
			console.log('Buying BTC: ' + quantity);
                	binance.marketBuy('BTCUSDT', quantity, (error, response) => {
                        	if(error){
                                	console.log(error.body);
                        	}
                        	console.log("Market Buy response", response);
                        	console.log("order id: " + response.orderId);
				if(response.orderId)
				{
					usdtBalance = 0.0;
                                        response.fills.forEach((fill) => {
                                                usdtBalance = usdtBalance + (fill.qty * fill.price);
                                        });
					binance.balance((error, balances) => {
						if ( error ) return console.error(error.body);
						btcBalance = balances.BTC.available;
						checkArbitrageInteveralId = setInterval(checkArbitrageSellBNB, 1000, btcBalance, usdtBalance);
						binance.bookTickers
					});
				}
                	});
		});	
	});
}

function runBuyBNB()
{
	var usdtBalance = 0.0;
	var bnbBalance = 0.0;
	var btcBalance = 0.0;
	binance.balance((error, balances) => {
        	if ( error ) return console.error(error.body);

		usdtBalance = balances.USDT.available;
		bnbBalance = balances.BNB.available;
		btcBalance = balances.BTC.available;

        	console.log("USDT balance: ", balances.USDT);
        	console.log("BNB balance: ", balances.BNB);
        	console.log("BTC balance: ", balances.BTC);

		binance.bookTickers('BNBUSDT', (error, ticker) => {
  			console.log("bookTickers", ticker);

			var quantity = parseFloat(usdtBalance / ticker.askPrice * 0.98).toFixed(2);
			console.log('Buying BNB: ' + quantity);
                	binance.marketBuy('BNBUSDT', quantity, (error, response) => {
                        	if(error){
                                	console.log(error.body);
                        	}
                        	console.log("Market Buy response", response);
                        	console.log("order id: " + response.orderId);
				if(response.orderId)
				{
					usdtBalance = 0.0;
					response.fills.forEach((fill) => {
						usdtBalance = usdtBalance + (fill.qty * fill.price);
					});
					binance.balance((error, balances) => {
						if ( error ) return console.error(error.body);
						bnbBalance = balances.BNB.available;
						checkArbitrageInteveralId = setInterval(checkArbitrageBuyBNB, 1000, bnbBalance, usdtBalance);
						binance.bookTickers
					});
				}
                	});
		});	
	});
}




runSellBNB();
//runBuyBNB();
