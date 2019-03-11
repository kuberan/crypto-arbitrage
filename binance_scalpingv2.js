const binance = require('node-binance-api')().options({
  APIKEY: 'tQfISqrkPSJ6e4aiLbtGQa6hGCmgnWg6c2aPZvSfMKdFrsSRsyNBMRrv7SY7zoe8',
  APISECRET: '0U2H7AFda9iAZNxrjX9bEL2D3tdL4wjvf7tkKZENM4Flkgfu6ExKj6Z7wbqsAgka',
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});


/*

	Strategy: Extended Arbitrage Arbitrage
	Strategy Description

	First Leg: USDT -> (BTC, ETH, BNB)
	Second Leg: (BTC, ETH, BNB) -> ALTS that are traded in USDT (or) sell it back for USDT if proft
	Third Leg: ALTS to USDT
	
	Target Profit
	In the second leg either sell back for USDT or look for arbitrage opportunities

	Stop Loss
	if both (BTC.ETH.BNB)/USDT and the arbitrage falls below a threshold execute it

*/

var checkNextLegInteveralId;

function tradeExtendedArbitrageStrategy(baseCurrency='USDT',
					buyCurrency='BTC',
					targetProfitPercent=0.5,
					stopLossPercent=0.5,
					feePercent=0.1)
{
	var standardMarkets = ['BTC', 'USDT', 'EOS', 'ETH'];
	if(!(standardMarkets.includes(baseCurrency))){
		console.log('baseCurrency should be one of BTC, USDT, EOS, ETH');
		return;
	}
	if(!(standardMarkets.includes(buyCurrency))){
		console.log('buyCurrency should be one of BTC, USDT, EOS, ETH');
		return;
	}
	if(baseCurrency == buyCurrency){
		console.log('buyCurrency cannot be same as baseCurrency');
		return;
	}

	var baseCurrencyBalance;
	var buyCurrencyBalance;
	binance.balance((error, balances) => {
		if ( error ) return console.error(error.body);
		baseCurrencyBalance = balances[baseCurrency].available;
		console.log(baseCurrency + ' balance: ' + baseCurrencyBalance);
		binance.bookTickers(buyCurrency + baseCurrency, (error, ticker) => {
			console.log("bookTickers", ticker);
			 var quantity = parseFloat(baseCurrencyBalance / ticker.askPrice * ((100.0 - feePercent) / 100.0)).toFixed(2);
                        console.log('Buying ' + buyCurrency + ': ' + quantity);
			binance.marketBuy(buyCurrency + baseCurrency, quantity, (error, response) => {
                                if(error){
                                        console.log(error.body);
                                }
                                console.log("Market Buy response", response);
                                console.log("first leg order id: " + response.orderId);
                                if(response.orderId)
                                {
                                        baseCurrencyBalance = 0.0;
                                        response.fills.forEach((fill) => {
                                                baseCurrencyBalance = baseCurrencyBalance + (fill.qty * fill.price);
                                        });
                                        binance.balance((error, balances) => {
                                                if ( error ) return console.error(error.body);
                                                buyCurrencyBalance = balances[buyCurrency].available;
                                                checkNextLegInteveralId = setInterval(checkNextLeg,
											1000,
											buyCurrencyBalance,
											baseCurrencyBalance,
											baseCurrency,
											buyCurrency,
											targetProfitPercent,
											stopLossPercent,
											feePercent);
                                        });
                                }
                        });
		});
	});
}

function checkNextLeg(buyCurrencyBalance=0.0,
			baseCurrencyBalance=0.0,
			baseCurrency='USDT',
			buyCurrency='BTC',
			targetProfitPercent=0.0,
			stopLossPercent=0.0,
			feePercent=0.0)
{
	binance.bookTickers((error, tickers) => {
		if ( error ) return console.error(error.body);
		var tickerData = {};
		tickers.forEach((ticker) => {
			tickerData[ticker.symbol] = ticker;
		});
		var maxLossPercent = 0.0;
		var maxProfitPercent = 0.0;
		var sellBackMaxProfit = 0.0;
		var sellBackMaxLoss = 0.0;
		Object.keys(tickerData).forEach(function(symbol) {
			var ticker = tickerData[symbol];
			var isBuyCurrencyBaseOfSymbol = symbol.indexOf(buyCurrency) == (symbol.length - buyCurrency.length);
			if(!isBuyCurrencyBaseOfSymbol){
				return;
			}
			var symbolBuyCurrency = symbol.substr(0, symbol.length - buyCurrency.length);	
			var isBuyCurrencyOfSymbolAvailableInBaseCurrencyMarket = (symbolBuyCurrency + baseCurrency) in tickerData;
			if(!isBuyCurrencyOfSymbolAvailableInBaseCurrencyMarket){
				return;
			}

			//Arbitrage Trade
			var thirdLegSymbol = symbolBuyCurrency + baseCurrency;
			var secondLegTradeBalance = buyCurrencyBalance / ticker.askPrice * ((100.0 - feePercent) / 100.0);
			var thirdLegTradeBalance = secondLegTradeBalance * tickerData[thirdLegSymbol].bidPrice * ((100.0 - feePercent) / 100.0);
			var profitPercent = parseFloat((thirdLegTradeBalance - baseCurrencyBalance)/(baseCurrencyBalance * ((100.0 - feePercent) / 100.0)) * 100.0).toFixed(2);
			//console.log(symbol + '->' + thirdLegSymbol);
			if (profitPercent > maxProfitPercent && profitPercent != Infinity)
			{
				maxProfitPercent = profitPercent;
				console.log(tickerData[symbol]);
				console.log(tickerData[thirdLegSymbol]);
			}
			if (profitPercent < maxLossPercent)
			{
				maxLossPercent = profitPercent;
			}

			//Sell Back Trade
			var sellBackTradeBalance = buyCurrencyBalance * tickerData[buyCurrency + baseCurrency].bidPrice * ((100.0 - feePercent) / 100.0);
			var sellBackProfitPercent = parseFloat((sellBackTradeBalance - baseCurrencyBalance)/(baseCurrencyBalance * ((100.0 - feePercent) / 100.0)) * 100.0).toFixed(2);
			if(sellBackProfitPercent > sellBackMaxProfit && sellBackProfitPercent != Infinity)
			{
				sellBackMaxProfit = sellBackProfitPercent;
				console.log(tickerData[buyCurrency + baseCurrency]);
			}
			if(sellBackProfitPercent < sellBackMaxLoss)
			{
				sellBackMaxLoss = sellBackProfitPercent;
			}
		});
		console.log('Arbitrage - ' + 'maxProfit ' + maxProfitPercent + '% maxLoss ' + maxLossPercent + '%');
		console.log('Sell Back - ' + 'maxProfit ' + sellBackMaxProfit + '% maxLoss ' + sellBackMaxLoss + '%');
	});
}

tradeExtendedArbitrageStrategy();
