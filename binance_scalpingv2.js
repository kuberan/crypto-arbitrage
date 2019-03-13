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
					buyCurrency='BNB',
					targetProfitPercent=1.0,
					stopLossPercent=1.0,
					feePercent=0.1)
{
	var standardMarkets = ['BTC', 'USDT', 'EOS', 'ETH', 'BNB'];
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
                        console.log('Buying ' + buyCurrency + ': ' + quantity + ' at ' + ticker.askPrice);
			binance.marketBuy(buyCurrency + baseCurrency, quantity, (error, response) => {
                                if(error){
                                        console.log(error.body);
                                }
                                console.log("Market Buy response", response);
                                console.log("first leg order id: " + response.orderId);
                                if(response.orderId)
                                {
                                        /*baseCurrencyBalance = 0.0;
                                        response.fills.forEach((fill) => {
                                                baseCurrencyBalance = baseCurrencyBalance + (fill.qty * fill.price);
                                        });*/
                                        binance.balance((error, balances) => {
                                                if ( error ) return console.error(error.body);
                                                buyCurrencyBalance = balances[buyCurrency].available;
						console.log(buyCurrency + ' balance: ' + buyCurrencyBalance);
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
		var maxLossPercent = parseFloat(0.0);
		var maxProfitPercent = parseFloat(0.0);
		var minLossPercent = parseFloat(-100.0);
		var sellBackProfitPercent = parseFloat(0.0);
		var maxProfitPercentTradeType;
		var minLossPercentTradeType;
		var maxProfitPercentSecondLegTradeBuyCurrency;
		var minLossPercentSecondLegTradeBuyCurrency;
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
			var profitPercent = parseFloat((thirdLegTradeBalance - baseCurrencyBalance)/baseCurrencyBalance * 100.0).toFixed(2);
			//console.log(symbol + '->' + thirdLegSymbol);
			if(profitPercent != Infinity)
			{
				if (profitPercent > maxProfitPercent)
				{
					maxProfitPercent = parseFloat(profitPercent);
					maxProfitPercentTradeType = 'ARBITRAGE';
					maxProfitPercentSecondLegTradeBuyCurrency = symbolBuyCurrency;
					console.log(tickerData[symbol]);
					console.log(tickerData[thirdLegSymbol]);
				}
				if (profitPercent < maxLossPercent)
				{
					maxLossPercent = parseFloat(profitPercent);
				}
				if(profitPercent < parseFloat(0.0) && profitPercent > minLossPercent)
				{
					minLossPercent = parseFloat(profitPercent);
					minLossPercentTradeType = 'ARBITRAGE';
					minLossPercentSecondLegTradeBuyCurrency = symbolBuyCurrency;
				}
			}

			//Sell Back Trade
			var sellBackTradeBalance = buyCurrencyBalance * tickerData[buyCurrency + baseCurrency].bidPrice * ((100.0 - feePercent) / 100.0);
			sellBackProfitPercent = parseFloat((sellBackTradeBalance - baseCurrencyBalance)/baseCurrencyBalance * 100.0).toFixed(2);
		});
		console.log('Arbitrage - ' + 'maxProfit ' + maxProfitPercent + '% maxLoss ' + maxLossPercent + '% minLoss' + minLossPercent + '%');
		console.log('SellBack Profit/Loss: ' + sellBackProfitPercent + '%');
		if(sellBackProfitPercent < parseFloat(0.0) && sellBackProfitPercent > minLossPercent)
		{
			minLossPercent = parseFloat(sellBackProfitPercent);
			minLossPercentTradeType = 'SELLBACK';
		}
		else if(sellBackProfitPercent > parseFloat(0.0) && sellBackProfitPercent > maxProfitPercent)
		{
			maxProfitPercent = parseFloat(sellBackProfitPercent);
			maxProfitPercentTradeType = 'SELLBACK';
		}
		console.log('Overall maxProfit: ' + maxProfitPercent + '% minLoss: ' + minLossPercent + '%');

		//Check Stop Loss or Target Profit Trigger
		if(maxProfitPercent >= parseFloat(targetProfitPercent))
		{
			clearInterval(checkNextLegInteveralId);
			if(maxProfitPercentTradeType == 'SELLBACK')
			{
				triggerSellBackTrade(baseCurrency, baseCurrencyBalance, buyCurrency, buyCurrencyBalance);
			}
			else if(maxProfitPercentTradeType == 'ARBITRAGE')
			{
				triggerArbitrageTrade(baseCurrency, maxProfitPercentSecondLegTradeBuyCurrency, buyCurrency);
			}
			else{
				console.log('Invalid maxProfitPercentTradeType');
			}
		}
		else if(minLossPercent <= parseFloat(-stopLossPercent))
		{
			clearInterval(checkNextLegInteveralId);
			if(minLossPercentTradeType == 'SELLBACK')
                        {
                                triggerSellBackTrade(baseCurrency, baseCurrencyBalance, buyCurrency, buyCurrencyBalance);
                        }
                        else if(minLossPercentTradeType == 'ARBITRAGE')
                        {
                                triggerArbitrageTrade(baseCurrency, minLossPercentSecondLegTradeBuyCurrency, buyCurrency);
                        }
                        else{
                                console.log('Invalid minLossPercentTradeType');
                        }
		}
	});
}

function triggerArbitrageTrade(baseCurrency, secondLegBuyCurrency, thirdLegSellCurrency)
{
	var secondLegMarket = secondLegBuyCurrency + thirdLegSellCurrency;
	var thirdLegMarket = thirdLegSellCurrency + baseCurrency;
	console.log('Arbitrage Trade Triggered');
	console.log('Triggered MARKET Order Buy ' + secondLegMarket);
	console.log('Triggered MARKET Order Sell ' + thirdLegMarket);
}

function triggerSellBackTrade(baseCurrency, baseCurrencyBalance, sellCurrency, sellQuantity)
{
	console.log('Sellback Trade Triggered');
	var market = sellCurrency + baseCurrency;
	console.log('Triggering MARKET order sell ' + market);
	binance.marketSell(buyCurrency + baseCurrency, sellQuantity, (error, response) => {
		if(error){ console.log(error.body); return; }
		console.log("Market Sell response ", response);
		console.log("Sellback Order id: " + response.orderId);
		if(response.orderId)
		{
			console.log('Triggered MARKET order sell with quantity: ' + sellQuantity + ' ' + sellCurrency);
			var finalBaseCurrencyBalance;
			response.fills.forEach((fill) => {
				finalBaseCurrencyBalance = finalBaseCurrencyBalance + (fill.qty * fill.price);
			});
			console.log(baseCurrency + ' balance: ' + finalBaseCurrencyBalance + ' ' + baseCurrency);
		}
	});
}

tradeExtendedArbitrageStrategy(baseCurrency='USDT',
                                        buyCurrency='BNB',
                                        targetProfitPercent=0.25,
                                        stopLossPercent=0.35,
                                        feePercent=0.1);
