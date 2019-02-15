var unirest = require('unirest');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

/*

- This Algorithm is making an assumption that the first leg and third leg will always have base currency as the second currency (for eg: EOSUSDT).
- This Algorithm only looks at a depth of 1 into the order book


Sample Paper Trade (Second Leg Sell Transaction) - Need to also do another paper trade for Second Leg Buy Transaction

"symbol": "BTTUSDT",
        "bidPrice": "0.00099600",
        "bidQty": "22090.00000000",
        "askPrice": "0.00099710",
        "askQty": "240988.00000000"

ask price
Sell 240.2891348 USDT (askPrice to askQty)
Buy 240988 BTT

"symbol": "BTTBNB",
        "bidPrice": "0.00010877",
        "bidQty": "1234862.00000000",
        "askPrice": "0.00010898",
        "askQty": "514740.00000000"

Bid 
Sell 240988 BTT
Buy 26.21226476 BNB (bid price * BTT quantity)

"symbol": "BNBUSDT",
        "bidPrice": "9.15080000",
        "bidQty": "58.33000000",
        "askPrice": "9.15700000",
        "askQty": "9.38000000"

bid
Sell 26.21226476 BNB
Buy 239.8631923658 USDT (bid price * BNB quantity)

Net USDT -$0.43

*/

function run()
{

	var checkOrderQuantity = false; // Check if Order quantity is sufficient for second and third leg
	var profitThresholdUSD = 0.00028;
        var baseCurrency = 'BTC';

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
        var netProfit;
	var netProfitPercent;
        var isSecondLegQuanitySufficient = false;
        var isThirdLegQuantitySufficient = false;
	var isOrderQuantitySufficient;


unirest.get('https://api.binance.com/api/v3/ticker/bookTicker')
.end(function (response) {
  	//console.log(response.body);
	allSymbols = [];
	firstLegSymbols = [];
	secondlegSymbols = [];
	priceDict = {};
	firstLegSymbolCurrency;
	secondLegSymbols;
	secondLegSymbolCurrency;
	thirdLegSymbols;
	thirdLegSymbolCurrency;
	firstLegTransaction = {};
	secondLegTransaction = {};
	thirdLegTransaction = {};
	netProfit;
	isSecondLegQuanitySufficient = false;
	isThirdLegQuantitySufficient = false;
	response.body.forEach((record) => {
	//	console.log(record.symbol);
	//	console.log(record.bidPrice);
	//	console.log(record.bidQty);
	//	console.log(record.askPrice);
	//	console.log(record.askQty);
		allSymbols.push(record.symbol);
		priceDict[record.symbol] = {'bidPrice':record.bidPrice, 'bidQty':record.bidQty, 'askPrice':record.askPrice, 'askQty':record.askQty};
	});
	allSymbols.forEach((symbol) => {
		if (symbol.includes(baseCurrency)){
			firstLegSymbols.push(symbol);
		}
	});
	//console.log(firstLegSymbols);

	firstLegSymbols.forEach((firstLegSymbol) => {
		firstLegSymbolCurrency = firstLegSymbol.substring(0, firstLegSymbol.length - baseCurrency.length);
		secondLegSymbols = [];
		allSymbols.forEach((symbol) => {
			if(symbol.includes(firstLegSymbolCurrency) && !(symbol.includes(baseCurrency))){
				secondLegSymbols.push(symbol);
			}
		});
		//console.log(secondLegSymbols);
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


				netProfit = (thirdLegTransaction['totalPriceBaseCurrency'] - firstLegTransaction['totalPriceBaseCurrency']);
				netProfitPercent = (thirdLegTransaction['totalPriceBaseCurrency'] - firstLegTransaction['totalPriceBaseCurrency'])/firstLegTransaction['totalPriceBaseCurrency'] * 100.0;

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

				if ((netProfit > profitThresholdUSD) && isOrderQuantitySufficient){
					console.log();
					console.log((new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString());
					console.log(firstLegSymbol + '->' + secondLegSymbol + '->' + thirdLegSymbol);

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
				
					console.log('Total Investment: (' + baseCurrency + ') ' + firstLegTransaction['totalPriceBaseCurrency']);	
					console.log('Net Profit: (' + baseCurrency + ') ' + netProfit );
					console.log('Net Profit: ' + parseFloat(netProfitPercent).toFixed(2) + '%');
				}
				//console.log('thirdLegSymbolCurrency: ' + thirdLegSymbolCurrency);
				//console.log('secondLegSymbolCurrency: ' + secondLegSymbolCurrency);
				assert(thirdLegSymbolCurrency == secondLegSymbolCurrency);
			});
		});
	});
});
}


setInterval(run, 1000);
