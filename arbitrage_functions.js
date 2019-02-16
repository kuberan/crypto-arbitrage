var assert = require('assert');


/*
	A Function to check the triangular arbitrage opportunity based on binance Order Book API with a depth of 1.
	It returns 3 trade signals if it meets the absolute profit threshold

	params
	checkOrderQuantity: Flag to enable to check if there is sufficient quantity to buy/sell in second and third leg trade
	profitThresholdPercent: Profit Threshold Percent
	baseCurrency: Currrency that will be retained as profit after all 3 trades
*/
function findTriangularArbitrage(data, checkOrderQuantity=false, profitThresholdPercent=0.3, baseCurrency='BTC', debug=false, feePercent=0.3)
{
	//var checkOrderQuantity = false; // Check if Order quantity is sufficient for second and third leg
        //var profitThresholdPercent = 0.00028;
        //var baseCurrency = 'BTC';

        var allSymbols = [];
        var firstLegSymbols = [];
        var secondlegSymbols = [];
        var priceDict = {};
        var firstLegSymbolCurrency;
        var secondLegSymbols;
        var secondLegSymbolCurrency;
        var thirdLegSymbols;
        var thirdLegSymbolCurrency;
        var firstLegTransaction = {};
        var secondLegTransaction = {};
        var thirdLegTransaction = {};
	var grossProfit;
	var grossProfitPercent;
        var netProfit;
        var netProfitPercent;
        var isSecondLegQuanitySufficient = false;
        var isThirdLegQuantitySufficient = false;
        var isOrderQuantitySufficient;

	data.forEach((record) => {
		allSymbols.push(record.symbol);
		priceDict[record.symbol] = {'bidPrice':record.bidPrice, 'bidQty':record.bidQty, 'askPrice':record.askPrice, 'askQty':record.askQty};
	});

	allSymbols.forEach((symbol) => {
		if (symbol.includes(baseCurrency)){
			firstLegSymbols.push(symbol);
		}
	});

	firstLegSymbols.forEach((firstLegSymbol) => {
		firstLegSymbolCurrency = firstLegSymbol.substring(0, firstLegSymbol.length - baseCurrency.length);
		secondLegSymbols = [];
		allSymbols.forEach((symbol) => {
			if(symbol.includes(firstLegSymbolCurrency) && !(symbol.includes(baseCurrency))){
				secondLegSymbols.push(symbol);
			}
		});
		secondLegSymbols.forEach((secondLegSymbol) => {
			if(secondLegSymbol.indexOf(firstLegSymbolCurrency) == 0)
			{
				//secondLegSymbolCurrency in first half
				secondLegSymbolCurrency = secondLegSymbol.substring(firstLegSymbolCurrency.length);
			}
			else
			{
				//secondLegSymbolCurrency in second half
				secondLegSymbolCurrency = secondLegSymbol.substring(0, secondLegSymbol.length - firstLegSymbolCurrency.length);
			}
			//console.log(secondLegSymbolCurrency);
			thirdLegSymbols = [];
			allSymbols.forEach((symbol) => {
				if((symbol.indexOf(secondLegSymbolCurrency) == 0) && symbol.includes(baseCurrency) && (symbol.length == ((baseCurrency.length + secondLegSymbolCurrency.length))))
				{
					thirdLegSymbols.push(symbol);
				}
			});
			//console.log(thirdLegSymbols);
			thirdLegSymbols.forEach((thirdLegSymbol) => {
				thirdLegSymbolCurrency = thirdLegSymbol.substring(0, thirdLegSymbol.length - baseCurrency.length);;
				//console.log(thirdLegSymbolCurrency);

				firstLegTransaction = {};
				firstLegTransaction['buyingCurrency'] = firstLegSymbolCurrency;
				firstLegTransaction['sellingCurrency'] = baseCurrency;
				firstLegTransaction['qty'] = priceDict[firstLegSymbol].askQty;
				firstLegTransaction['price'] = priceDict[firstLegSymbol].askPrice;
				firstLegTransaction['totalPriceBaseCurrency'] = priceDict[firstLegSymbol].askQty * priceDict[firstLegSymbol].askPrice;
				firstLegTransaction['orderType'] = 'BUY';
				firstLegTransaction['symbol'] = firstLegSymbol;

				secondLegTransaction = {};
				secondLegTransaction['buyingCurrency'] = secondLegSymbolCurrency;
				secondLegTransaction['sellingCurrency'] = firstLegSymbolCurrency;
				secondLegTransaction['symbol'] = secondLegSymbol;
				if (allSymbols.includes(secondLegSymbolCurrency + firstLegSymbolCurrency))
				{
					//Need to verify this on another paper trade for this case
					////////////



					///////////
					secondLegTransaction['orderType'] = 'BUY';
					secondLegTransaction['qty'] = firstLegTransaction['qty'] / priceDict[secondLegSymbol].askPrice;
					if (!isFinite(secondLegTransaction['qty']))
					{
						 secondLegTransaction['qty'] = 0.0;
					}
					secondLegTransaction['price'] = priceDict[secondLegSymbol].askPrice;
                                        secondLegTransaction['totalPrice'] = firstLegTransaction['qty'];
				}
				else{
					//paper trade example
					secondLegTransaction['orderType'] = 'SELL';
					secondLegTransaction['qty'] = priceDict[secondLegSymbol].bidPrice * firstLegTransaction['qty'];
					secondLegTransaction['price'] = priceDict[secondLegSymbol].bidPrice;
					secondLegTransaction['totalPrice'] = firstLegTransaction['qty'];
				}

				thirdLegTransaction = {};
				thirdLegTransaction['buyingCurrency'] = baseCurrency;
				thirdLegTransaction['sellingCurrency'] = thirdLegSymbolCurrency;
				thirdLegTransaction['qty'] = secondLegTransaction['qty'];
				thirdLegTransaction['price'] = priceDict[thirdLegSymbol].bidPrice;
				thirdLegTransaction['totalPriceBaseCurrency'] = thirdLegTransaction['qty'] * thirdLegTransaction['price'];
				thirdLegTransaction['orderType'] = 'SELL';
				thirdLegTransaction['symbol'] = thirdLegSymbol;


				grossProfit = (thirdLegTransaction['totalPriceBaseCurrency'] - firstLegTransaction['totalPriceBaseCurrency']);
				grossProfitPercent = (thirdLegTransaction['totalPriceBaseCurrency'] - firstLegTransaction['totalPriceBaseCurrency'])/firstLegTransaction['totalPriceBaseCurrency'] * 100.0;
				netProfitPercent = grossProfitPercent - feePercent;
				netProfit = netProfitPercent / grossProfitPercent * grossProfit;

				isSecondLegQuanitySufficient = false;
				if (firstLegTransaction['qty'] <= secondLegTransaction['qty'])
				{
					isSecondLegQuanitySufficient = true;
				}

				isThirdLegQuantitySufficient = false;
				if(thirdLegTransaction['qty'] <= priceDict[thirdLegSymbol].bidQty)
				{
					 isThirdLegQuantitySufficient = true;
				}

				
				isOrderQuantitySufficient = true;
				if(checkOrderQuantity){
					if(!isSecondLegQuanitySufficient || !isThirdLegQuantitySufficient)
					{
						isOrderQuantitySufficient = false;
					}
				}

				if ((grossProfitPercent > profitThresholdPercent) && isOrderQuantitySufficient){
					console.log();
					//console.log((new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString());
					console.log(firstLegSymbol + '->' + secondLegSymbol + '->' + thirdLegSymbol);

					if(debug == true)
					{
						console.log('First Leg Order Book: ' + firstLegSymbol);
                                		console.log(priceDict[firstLegSymbol]);
                                		console.log('First Leg Order');
                                		console.log(firstLegTransaction);

						console.log('Second Leg Order Book: ' + secondLegSymbol);
                                		console.log(priceDict[secondLegSymbol]);
                                		console.log('Second Leg Order');
                                		console.log(secondLegTransaction);

						console.log('Third Leg Order Book: ' + thirdLegSymbol);
						console.log(priceDict[thirdLegSymbol]);
						console.log('Third Leg Order');
                                		console.log(thirdLegTransaction);
					}
				
					console.log('Total Investment: (' + baseCurrency + ') ' + firstLegTransaction['totalPriceBaseCurrency']);	
					console.log('Gross Profit before fee: (' + baseCurrency + ') ' + grossProfit );
					console.log('Gross Profit before fee: ' + parseFloat(grossProfitPercent).toFixed(2) + '%');
					console.log('Net Profit after fee: (' + baseCurrency + ') ' + netProfit );
                                        console.log('Net Profit after fee: ' + parseFloat(netProfitPercent).toFixed(2) + '%');
				}
				//console.log('thirdLegSymbolCurrency: ' + thirdLegSymbolCurrency);
				//console.log('secondLegSymbolCurrency: ' + secondLegSymbolCurrency);
				assert(thirdLegSymbolCurrency == secondLegSymbolCurrency);
			});
		});
	});
}

module.exports = {
	findTriangularArbitrage,	
};
